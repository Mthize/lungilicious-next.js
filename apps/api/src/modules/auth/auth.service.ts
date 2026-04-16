import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { Queue } from 'bullmq';
import { createHash, randomUUID } from 'node:crypto';
import { verify } from 'otplib';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { FastifyRequest } from 'fastify';
import { PrismaService, type PrismaTransactionClient } from '../../common/database/prisma.service.js';
import {
  PasswordChangedEvent,
  UserRegisteredEvent,
} from '../../common/events/index.js';
import { QUEUE_EMAIL } from '../../common/queue/queue.constants.js';
import { CartService } from '../cart/cart.service.js';
import type { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { MfaVerifyDto } from './dto/mfa-verify.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { ResetPasswordDto } from './dto/reset-password.dto.js';
import type { VerifyEmailDto } from './dto/verify-email.dto.js';

const registerUserSelect = {
  id: true,
  email: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

type RegisteredUser = {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

type SessionPayload = {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
};

type SessionStore = {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: () => void;
};

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const TOKEN_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue(QUEUE_EMAIL) private readonly emailQueue: Queue,
    private readonly cartService: CartService,
  ) {}

  async register({ email, password, firstName, lastName }: RegisterDto): Promise<RegisteredUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
    const token = randomUUID();
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    try {
      const user = await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
        const customerRole = await tx.role.findUnique({
          where: { name: 'CUSTOMER' },
          select: { id: true },
        });

        if (!customerRole) {
          throw new InternalServerErrorException('Customer role is not configured');
        }

        const createdUser = await tx.user.create({
          data: {
            email,
            passwordHash,
          },
          select: {
            id: true,
          },
        });

        await tx.customer.create({
          data: {
            userId: createdUser.id,
            firstName,
            lastName,
          },
        });

        await tx.userRole.create({
          data: {
            userId: createdUser.id,
            roleId: customerRole.id,
          },
        });

        await tx.emailVerification.create({
          data: {
            userId: createdUser.id,
            tokenHash,
            expiresAt,
          },
        });

        return tx.user.findUniqueOrThrow({
          where: { id: createdUser.id },
          select: registerUserSelect,
        });
      });

      await this.emailQueue.add('verify-email', {
        userId: user.id,
        email: user.email,
        token,
      });

      this.eventEmitter.emit(
        'user.registered',
        new UserRegisteredEvent(user.id, email, firstName, lastName),
      );

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }
  }

  async login(
    { email, password }: LoginDto,
    request: FastifyRequest,
  ): Promise<RegisteredUser> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        deletedAt: true,
      },
    });

    const invalidCredentialsError = new UnauthorizedException('Invalid credentials');

    if (!user || user.deletedAt) {
      throw invalidCredentialsError;
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);

    if (!passwordMatches) {
      throw invalidCredentialsError;
    }

    const requestSession = this.getRequestSession(request);
    const guestSessionId = requestSession.get('sessionId');
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        ipAddress: request.ip ?? null,
        userAgent: request.headers['user-agent'] ?? null,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        revokedAt: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    requestSession.set('userId', user.id);
    requestSession.set('sessionId', session.id);

    const registeredUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: registerUserSelect,
    });

    if (registeredUser.customer?.id && typeof guestSessionId === 'string' && guestSessionId.length > 0) {
      await this.cartService.mergeGuestCart(guestSessionId, registeredUser.customer.id, session.id);
    }

    return registeredUser;
  }

  async logout(request: FastifyRequest): Promise<void> {
    const requestSession = this.getRequestSession(request);
    const sessionId = requestSession.get('sessionId');

    if (typeof sessionId === 'string' && sessionId.length > 0) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      });
    }

    requestSession.delete();
  }

  async refresh(request: FastifyRequest): Promise<SessionPayload> {
    const requestSession = this.getRequestSession(request);
    const userId = requestSession.get('userId');
    const oldSessionId = requestSession.get('sessionId');

    if (typeof userId !== 'string' || userId.length === 0) {
      throw new UnauthorizedException('Not authenticated');
    }

    const newSession = await this.prisma.session.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        ipAddress: request.ip ?? null,
        userAgent: request.headers['user-agent'] ?? null,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        revokedAt: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    if (typeof oldSessionId === 'string' && oldSessionId.length > 0) {
      await this.prisma.session.update({
        where: { id: oldSessionId },
        data: { revokedAt: new Date() },
      });
    }

    requestSession.set('userId', userId);
    requestSession.set('sessionId', newSession.id);

    return newSession;
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      return;
    }

    const token = randomUUID();
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    await this.emailQueue.add('reset-password', {
      userId: user.id,
      email: user.email,
      token,
    });
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (
      !passwordReset
      || passwordReset.usedAt
      || passwordReset.expiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });
    const revokedAt = new Date();
    const resetUser = await this.prisma.user.findUnique({
      where: { id: passwordReset.userId },
      select: { email: true },
    });

    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.user.update({
        where: { id: passwordReset.userId },
        data: { passwordHash },
      });

      await tx.passwordReset.update({
        where: { id: passwordReset.id },
        data: { usedAt: revokedAt },
      });

      await tx.session.updateMany({
        where: {
          userId: passwordReset.userId,
          revokedAt: null,
        },
        data: { revokedAt },
      });
    });

    if (resetUser) {
      this.eventEmitter.emit(
        'user.password-changed',
        new PasswordChangedEvent(passwordReset.userId, resetUser.email),
      );
    }
  }

  async verifyEmail({ token }: VerifyEmailDto): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const emailVerification = await this.prisma.emailVerification.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (
      !emailVerification
      || emailVerification.usedAt
      || emailVerification.expiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const verifiedAt = new Date();

    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.user.update({
        where: { id: emailVerification.userId },
        data: { emailVerifiedAt: verifiedAt },
      });

      await tx.emailVerification.update({
        where: { id: emailVerification.id },
        data: { usedAt: verifiedAt },
      });
    });
  }

  async verifyMfa(
    { code, factorId }: MfaVerifyDto,
    request: FastifyRequest,
  ): Promise<void> {
    const requestSession = this.getRequestSession(request);
    const userId = requestSession.get('userId');

    if (typeof userId !== 'string' || userId.length === 0) {
      throw new UnauthorizedException('Not authenticated');
    }

    const factor = await this.prisma.mfaFactor.findFirst({
      where: {
        id: factorId,
        userId,
      },
      select: {
        id: true,
        secret: true,
      },
    });

    if (!factor) {
      throw new UnauthorizedException('Invalid MFA factor');
    }

    const verificationResult = await verify({
      token: code,
      secret: factor.secret,
    });
    const isValid = verificationResult.valid;

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }
  }

  private getRequestSession(request: FastifyRequest): SessionStore {
    return request.session as SessionStore;
  }
}
