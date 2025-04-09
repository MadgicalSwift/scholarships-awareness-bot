import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';

@Injectable()
export class RedisService {
  private cache: NodeCache;
  private readonly cacheTTL: number = parseInt(process.env.REDIS_TTL) || 86400; // Default to 1 day

  constructor() {
    this.cache = new NodeCache({ stdTTL: this.cacheTTL });
  }

  async get(key: string): Promise<string | null> {
    const value = this.cache.get<string>(key);
    console.log(key)
    console.log("value",value)
    return value ?? null;
  }

  async set(key: string, value: string, expiryMode: 'EX' | 'PX' = 'EX', time?: number): Promise<void> {
    const ttl = time || this.cacheTTL;
    console.log("update",key)
    console.log("update",value)
    this.cache.set(key, value, ttl);
  }

  getTtl(key: string): number | null {
    const ttl = this.cache.getTtl(key);
    return ttl ? ttl - Date.now() : null; // Return time left in milliseconds
  }
}
