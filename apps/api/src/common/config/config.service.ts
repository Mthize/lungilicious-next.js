import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT', 3001) as number;
  }

  get nodeEnv(): 'development' | 'production' | 'test' {
    return this.config.get<'development' | 'production' | 'test'>('NODE_ENV') as 'development' | 'production' | 'test';
  }

  get isProd(): boolean {
    return this.nodeEnv === 'production';
  }

  get databaseUrl(): string {
    return this.config.get<string>('DATABASE_URL') as string;
  }

  get redisUrl(): string {
    return this.config.get<string>('REDIS_URL') as string;
  }

  get sessionSecret(): string {
    return this.config.get<string>('SESSION_SECRET') as string;
  }

  get corsOrigins(): string[] {
    const val = this.config.get<string>('CORS_ORIGINS');
    return val ? val.split(',') : ['http://localhost:3000'];
  }

  get s3Bucket(): string | undefined {
    return this.config.get<string>('S3_BUCKET');
  }

  get s3Region(): string | undefined {
    return this.config.get<string>('S3_REGION');
  }

  get s3AccessKeyId(): string | undefined {
    return this.config.get<string>('S3_ACCESS_KEY_ID');
  }

  get s3SecretAccessKey(): string | undefined {
    return this.config.get<string>('S3_SECRET_ACCESS_KEY');
  }

  get s3Endpoint(): string | undefined {
    return this.config.get<string>('S3_ENDPOINT');
  }

  get peachEntityId(): string | undefined {
    return this.config.get<string>('PEACH_ENTITY_ID');
  }

  get peachSecretToken(): string | undefined {
    return this.config.get<string>('PEACH_SECRET_TOKEN');
  }

  get peachWebhookSecret(): string | undefined {
    return this.config.get<string>('PEACH_WEBHOOK_SECRET');
  }

  get peachApiUrl(): string | undefined {
    return this.config.get<string>('PEACH_API_URL');
  }

  get logLevel(): 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' {
    return this.config.get<'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'>('LOG_LEVEL') as 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  }
}
