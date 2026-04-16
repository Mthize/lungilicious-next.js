import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProfileUpdatedEvent } from '../../common/events/index.js';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

const customerProfileSelect = {
  id: true,
  userId: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  marketingConsent: true,
  communicationConsent: true,
  createdAt: true,
  updatedAt: true,
  preference: {
    select: {
      id: true,
      currency: true,
      language: true,
      dietaryFlags: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  user: {
    select: {
      id: true,
      email: true,
    },
  },
} as const;

export type CustomerProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  marketingConsent: boolean;
  communicationConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
  preference: {
    id: string;
    currency: string;
    language: string;
    dietaryFlags: string[];
    createdAt: Date;
    updatedAt: Date;
  } | null;
  user: {
    id: string;
    email: string;
  };
};

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getProfile(userId: string): Promise<CustomerProfile> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      select: customerProfileSelect,
    });

    if (!customer || customer.user.id !== userId) {
      throw new NotFoundException('Customer profile not found');
    }

    return customer as CustomerProfile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<CustomerProfile> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    await this.prisma.customer.update({
      where: { userId },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.marketingConsent !== undefined
          ? { marketingConsent: dto.marketingConsent }
          : {}),
        ...(dto.communicationConsent !== undefined
          ? { communicationConsent: dto.communicationConsent }
          : {}),
      },
    });

    this.eventEmitter.emit(
      'customer.profile-updated',
      new ProfileUpdatedEvent(userId, customer.id),
    );

    return this.getProfile(userId);
  }
}
