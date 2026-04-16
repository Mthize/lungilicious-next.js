import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { RedisService } from '../../common/redis/redis.service.js';

type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  updatedAt: Date;
};

const FEATURE_FLAG_TTL_SECONDS = 60;

@Injectable()
export class FeatureFlagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async isEnabled(name: string): Promise<boolean> {
    const cacheKey = this.getCacheKey(name);
    const cachedValue = await this.redis.get(cacheKey);

    if (cachedValue !== null) {
      const cachedFlag = this.parseCachedFlag(cachedValue);

      return cachedFlag?.isEnabled === true;
    }

    const flag = await this.prisma.featureFlag.findUnique({
      where: { name },
    });

    await this.redis.setex(
      cacheKey,
      FEATURE_FLAG_TTL_SECONDS,
      JSON.stringify(flag),
    );

    return flag?.isEnabled === true;
  }

  async get(name: string): Promise<FeatureFlag | null> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name },
    });

    return flag as FeatureFlag | null;
  }

  private getCacheKey(name: string): string {
    return `feature_flag:${name}`;
  }

  private parseCachedFlag(value: string): FeatureFlag | null {
    try {
      return JSON.parse(value) as FeatureFlag | null;
    } catch {
      return null;
    }
  }
}
