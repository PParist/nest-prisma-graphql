import { Inject, Injectable, Logger } from '@nestjs/common';
import { CachePort } from 'src/cache/port/cache.port';
import * as Redis from 'ioredis';

@Injectable()
export class RedisCacheAdapter implements CachePort {
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private readonly client: Redis.Redis;

  constructor(@Inject('REDIS_CLIENT') redisClient: Redis.Redis) {
    this.client = redisClient;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}: ${error.message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        // TTL ใน Redis ใช้วินาทีเป็นหน่วย
        await this.client.set(key, serializedValue, 'EX', ttl);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}: ${error.message}`);
    }
  }

  async clear(): Promise<void> {
    try {
      // การล้าง Redis ทั้งหมดไม่แนะนำในโปรดักชัน
      // แต่สำหรับทดสอบอาจใช้ FLUSHDB
      await this.client.flushdb();
      this.logger.warn('Cleared entire Redis database');
    } catch (error) {
      this.logger.error(`Error clearing cache: ${error.message}`);
    }
  }

  async mget<T>(keys: string[]): Promise<Record<string, T>> {
    try {
      if (!keys.length) return {};

      const values = await this.client.mget(keys);
      const result: Record<string, T> = {};

      keys.forEach((key, index) => {
        const value = values[index];
        if (value) {
          result[key] = JSON.parse(value) as T;
        }
      });

      return result;
    } catch (error) {
      this.logger.error(`Error multi-getting cache keys: ${error.message}`);
      return {};
    }
  }

  async mset<T>(entries: Record<string, T>, ttl?: number): Promise<void> {
    try {
      const pipeline = this.client.pipeline();

      Object.entries(entries).forEach(([key, value]) => {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          pipeline.set(key, serializedValue, 'EX', ttl);
        } else {
          pipeline.set(key, serializedValue);
        }
      });

      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Error multi-setting cache keys: ${error.message}`);
    }
  }

  async mdelete(keys: string[]): Promise<void> {
    try {
      if (keys.length) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Error multi-deleting cache keys: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Error checking if key ${key} exists: ${error.message}`,
      );
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      // ใช้ SCAN เพื่อหาคีย์ที่ตรงกับรูปแบบ
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;

        if (keys.length) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      this.logger.error(
        `Error deleting keys by pattern ${pattern}: ${error.message}`,
      );
    }
  }

  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await this.client.incrby(key, value);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}: ${error.message}`);
      return 0;
    }
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    try {
      return await this.client.decrby(key, value);
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}: ${error.message}`);
      return 0;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting TTL for key ${key}: ${error.message}`);
      return false;
    }
  }
}
