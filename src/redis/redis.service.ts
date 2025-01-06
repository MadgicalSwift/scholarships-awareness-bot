import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: any;
  private readonly redisUrl = process.env.REDIS_URL;
  private readonly redisTTL: number = parseInt(process.env.REDIS_TTL);

  constructor() {
    this.redisClient = createClient({
      url: this.redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      },
    });
    this.redisClient.on('error', (e: any) => {
      console.log('Redis error', e);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.redisClient.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(
    key: string,
    value: string,
    expiryMode: 'EX' | 'PX' = 'EX',
    time: number = this.redisTTL,
  ): Promise<void> {
    if (expiryMode && time) {
      await this.redisClient.set(key, value, expiryMode, time);
    } else {
      await this.redisClient.set(key, value);
    }
  }
}