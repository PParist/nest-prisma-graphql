import { Inject, Injectable, Logger } from '@nestjs/common';
import { CachePort } from './port/cache.port';

@Injectable()
export class LocalCacheService {
  private readonly logger = new Logger(LocalCacheService.name);

  constructor(
    @Inject('LOCAL_CACHE_PORT') private readonly cachePort: CachePort,
  ) {}

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cachePort.get<T>(key);
      return result;
    } catch (error) {
      this.logger.warn(`Error getting cache key ${key}: ${error.message}`);
      return null; // Graceful degradation on cache failure
    }
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cachePort.set<T>(key, value, ttl);
    } catch (error) {
      this.logger.warn(`Error setting cache key ${key}: ${error.message}`);
      // Continue execution even if cache fails
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cachePort.delete(key);
    } catch (error) {
      this.logger.warn(`Error deleting cache key ${key}: ${error.message}`);
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
   * Delete keys by pattern (if supported by cache implementation)
   * @param pattern Pattern to match keys (e.g., user:*:profile)
   */
  async deletePattern(pattern: string): Promise<void> {
    if (this.cachePort.deletePattern) {
      try {
        await this.cachePort.deletePattern(pattern);
      } catch (error) {
        this.logger.warn(
          `Error deleting cache keys by pattern ${pattern}: ${error.message}`,
        );
      }
    } else {
      this.logger.debug(
        `DeletePattern not supported by current cache implementation`,
      );
    }
  }

  /**
   * Get or set cache value (atomic operation)
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
      this.logger.warn(`Error in getOrSet for key ${key}: ${error.message}`);
      // If cache fails, just execute factory
      return factory();
    }
  }

  /**
   * Increment a numeric value in cache
   * @param key Cache key
   * @param value Value to increment by (default: 1)
   * @returns New value after increment or null if operation failed
   */
  async increment(key: string, value: number = 1): Promise<number | null> {
    if (this.cachePort.increment) {
      try {
        return await this.cachePort.increment(key, value);
      } catch (error) {
        this.logger.warn(
          `Error incrementing cache key ${key}: ${error.message}`,
        );
      }
    } else {
      this.logger.debug(
        `Increment not supported by current cache implementation`,
      );
    }
    return null;
  }

  /**
   * Decrement a numeric value in cache
   * @param key Cache key
   * @param value Value to decrement by (default: 1)
   * @returns New value after decrement or null if operation failed
   */
  async decrement(key: string, value: number = 1): Promise<number | null> {
    if (this.cachePort.decrement) {
      try {
        return await this.cachePort.decrement(key, value);
      } catch (error) {
        this.logger.warn(
          `Error decrementing cache key ${key}: ${error.message}`,
        );
      }
    } else {
      this.logger.debug(
        `Decrement not supported by current cache implementation`,
      );
    }
    return null;
  }

  /**
   * Set TTL for an existing key
   * @param key Cache key
   * @param ttl Time to live in seconds
   * @returns Boolean indicating if operation was successful
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (this.cachePort.expire) {
      try {
        return await this.cachePort.expire(key, ttl);
      } catch (error) {
        this.logger.warn(
          `Error setting TTL for cache key ${key}: ${error.message}`,
        );
      }
    } else {
      this.logger.debug(`Expire not supported by current cache implementation`);
    }
    return false;
  }
}
