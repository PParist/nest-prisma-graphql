// src/cache/distributed-cache.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CachePort } from './port/cache.port';
import { PERFIX } from '@common/constans/cache';

@Injectable()
export class DistributedCacheService {
  private readonly logger = new Logger(DistributedCacheService.name);
  private readonly keyPrefix = PERFIX; // Prefix for all cache keys

  constructor(
    @Inject('DISTRIBUTED_CACHE_PORT') private readonly cachePort: CachePort,
  ) {}

  /**
   * Get a value from distributed cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const prefixedKey = this.getKeyWithPrefix(key);
    try {
      const result = await this.cachePort.get<T>(prefixedKey);
      return result;
    } catch (error) {
      this.logger.warn(
        `[DistributedCache] Error getting key ${prefixedKey}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Set a value in distributed cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const prefixedKey = this.getKeyWithPrefix(key);
    try {
      await this.cachePort.set<T>(prefixedKey, value, ttl);
    } catch (error) {
      this.logger.warn(
        `[DistributedCache] Error setting key ${prefixedKey}: ${error.message}`,
      );
    }
  }

  /**
   * Delete a value from distributed cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    const prefixedKey = this.getKeyWithPrefix(key);
    try {
      await this.cachePort.delete(prefixedKey);
    } catch (error) {
      this.logger.warn(
        `[DistributedCache] Error deleting key ${prefixedKey}: ${error.message}`,
      );
    }
  }
  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.cachePort.clear();
    } catch (error) {
      this.logger.warn(`Error clearing cache: ${error.message}`);
    }
  }

  /**
   * Get multiple values from cache
   * @param keys Array of cache keys
   * @returns Object with key-value pairs of found cache items
   */
  async mget<T>(keys: string[]): Promise<Record<string, T>> {
    if (!keys.length) return {};

    if (this.cachePort.mget) {
      try {
        return await this.cachePort.mget<T>(keys);
      } catch (error) {
        this.logger.warn(`Error multi-getting cache keys: ${error.message}`);
      }
    }

    // Fallback to individual gets if mget not implemented
    const result: Record<string, T> = {};

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        if (value !== null) {
          result[key] = value;
        }
      }),
    );

    return result;
  }

  /**
   * Set multiple values in cache
   * @param entries Object with key-value pairs to cache
   * @param ttl Time to live in seconds (optional)
   */
  async mset<T>(entries: Record<string, T>, ttl?: number): Promise<void> {
    if (this.cachePort.mset) {
      try {
        await this.cachePort.mset<T>(entries, ttl);
        return;
      } catch (error) {
        this.logger.warn(`Error multi-setting cache keys: ${error.message}`);
      }
    }

    // Fallback to individual sets if mset not implemented
    await Promise.all(
      Object.entries(entries).map(([key, value]) => this.set(key, value, ttl)),
    );
  }

  /**
   * Delete multiple keys from cache
   * @param keys Array of keys to delete
   */
  async mdelete(keys: string[]): Promise<void> {
    if (!keys.length) return;

    if (this.cachePort.mdelete) {
      try {
        await this.cachePort.mdelete(keys);
        return;
      } catch (error) {
        this.logger.warn(`Error multi-deleting cache keys: ${error.message}`);
      }
    }

    // Fallback to individual deletes if mdelete not implemented
    await Promise.all(keys.map((key) => this.delete(key)));
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns boolean indicating if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (this.cachePort.exists) {
      try {
        return await this.cachePort.exists(key);
      } catch (error) {
        this.logger.warn(
          `Error checking if key ${key} exists: ${error.message}`,
        );
      }
    }

    // Fallback if exists not implemented
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get or set distributed cache value (atomic operation)
   * @param key Cache key
   * @param factory Function that returns value to cache if key not found
   * @param ttl Time to live in seconds (optional)
   * @returns Cached value or newly generated value
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const prefixedKey = this.getKeyWithPrefix(key);
    try {
      // Try to get from cache first
      const cachedValue = await this.get<T>(key);

      if (cachedValue !== null) {
        return cachedValue;
      }

      // If not in cache, generate value
      const newValue = await factory();

      // Store in cache
      await this.set(key, newValue, ttl);

      return newValue;
    } catch (error) {
      this.logger.warn(
        `[DistributedCache] Error in getOrSet for key ${prefixedKey}: ${error.message}`,
      );
      // If cache fails, just execute factory
      return factory();
    }
  }

  /**
   * Delete keys by pattern from distributed cache
   * @param pattern Pattern to match keys (e.g., user:*:profile)
   */
  async deletePattern(pattern: string): Promise<void> {
    const prefixedPattern = this.getKeyWithPrefix(pattern);
    if (this.cachePort.deletePattern) {
      try {
        await this.cachePort.deletePattern(prefixedPattern);
      } catch (error) {
        this.logger.warn(
          `[DistributedCache] Error deleting keys by pattern ${prefixedPattern}: ${error.message}`,
        );
      }
    } else {
      this.logger.warn(
        `[DistributedCache] DeletePattern not supported by current cache implementation`,
      );
    }
  }

  /**
   * Helper to prefix all distributed cache keys
   */
  private getKeyWithPrefix(key: string): string {
    return `${this.keyPrefix}${key}`;
  }
}
