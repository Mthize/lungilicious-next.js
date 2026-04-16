import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(message: string, context?: string): void {
    this.logger.info({ msg: message, context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error({ msg: message, trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn({ msg: message, context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug({ msg: message, context });
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({ msg: message, context });
  }
}
