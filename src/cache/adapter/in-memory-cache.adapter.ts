import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CachePort } from 'src/cache/port/cache.port';

@Injectable()
export class InMemoryCacheAdapter implements CachePort {
  private readonly logger = new Logger(InMemoryCacheAdapter.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}: ${error.message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}: ${error.message}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheManager.clear();
    } catch (error) {
      this.logger.error(`Error clearing cache: ${error.message}`);
    }
  }

  async mget<T>(keys: string[]): Promise<Record<string, T>> {
    try {
      const result: Record<string, T> = {};

      // Execute in parallel for better performance
      await Promise.all(
        keys.map(async (key) => {
          const value = await this.get<T>(key);
          if (value !== null) {
            result[key] = value;
          }
        }),
      );

      return result;
    } catch (error) {
      this.logger.error(`Error multi-getting cache keys: ${error.message}`);
      return {};
    }
  }

  async mset<T>(entries: Record<string, T>, ttl?: number): Promise<void> {
    try {
      // Execute in parallel for better performance
      await Promise.all(
        Object.entries(entries).map(([key, value]) =>
          this.set(key, value, ttl),
        ),
      );
    } catch (error) {
      this.logger.error(`Error multi-setting cache keys: ${error.message}`);
    }
  }

  async mdelete(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.delete(key)));
    } catch (error) {
      this.logger.error(`Error multi-deleting cache keys: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch (error) {
      this.logger.error(
        `Error checking if key ${key} exists: ${error.message}`,
      );
      return false;
    }
  }

  // Simple pattern matching for in-memory cache (not as efficient as Redis)
  async deletePattern(pattern: string): Promise<void> {
    try {
      // Convert wildcard pattern to regex
      //const regexPattern = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);

      // This is not ideal for production due to memory scan
      // In-memory cache doesn't expose stored keys directly
      // This is a best-effort implementation

      this.logger.warn(
        'deletePattern for in-memory cache is limited and may not be efficient',
      );

      // For most in-memory cache managers, we cannot enumerate keys
      // Consider using Redis in production if this feature is needed
    } catch (error) {
      this.logger.error(
        `Error deleting keys by pattern ${pattern}: ${error.message}`,
      );
    }
  }

  // Additional implementations suitable for in-memory cache

  async increment(key: string, value: number = 1): Promise<number> {
    try {
      // Get current value
      const currentValue = (await this.get<number>(key)) || 0;

      // Calculate new value
      const newValue = currentValue + value;

      // Store new value
      await this.set(key, newValue);

      return newValue;
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}: ${error.message}`);
      return 0;
    }
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    try {
      // Get current value
      const currentValue = (await this.get<number>(key)) || 0;

      // Calculate new value
      const newValue = currentValue - value;

      // Store new value
      await this.set(key, newValue);

      return newValue;
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}: ${error.message}`);
      return 0;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      // Get current value
      const value = await this.get(key);

      if (value === null) {
        return false;
      }

      // Re-set with new TTL
      await this.set(key, value, ttl);

      return true;
    } catch (error) {
      this.logger.error(`Error setting TTL for key ${key}: ${error.message}`);
      return false;
    }
  }
}
