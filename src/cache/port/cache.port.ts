export interface CachePort {
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;

  /**
   * Get multiple values from cache (optional)
   * @param keys Array of cache keys
   * @returns Object with key-value pairs of found cache items
   */
  mget?<T>(keys: string[]): Promise<Record<string, T>>;

  /**
   * Set multiple values in cache (optional)
   * @param entries Object with key-value pairs to cache
   * @param ttl Time to live in seconds (optional)
   */
  mset?<T>(entries: Record<string, T>, ttl?: number): Promise<void>;

  /**
   * Delete multiple keys from cache (optional)
   * @param keys Array of keys to delete
   */
  mdelete?(keys: string[]): Promise<void>;

  /**
   * Check if key exists in cache (optional)
   * @param key Cache key
   * @returns boolean indicating if key exists
   */
  exists?(key: string): Promise<boolean>;

  /**
   * Delete keys by pattern (optional, Redis-specific)
   * @param pattern Pattern to match keys (e.g., user:*:profile)
   */
  deletePattern?(pattern: string): Promise<void>;

  /**
   * Increment a numeric value in cache (optional)
   * @param key Cache key
   * @param value Value to increment by
   * @returns New value after increment
   */
  increment?(key: string, value?: number): Promise<number>;

  /**
   * Decrement a numeric value in cache (optional)
   * @param key Cache key
   * @param value Value to decrement by
   * @returns New value after decrement
   */
  decrement?(key: string, value?: number): Promise<number>;

  /**
   * Set TTL for an existing key (optional)
   * @param key Cache key
   * @param ttl Time to live in seconds
   * @returns Boolean indicating if operation was successful
   */
  expire?(key: string, ttl: number): Promise<boolean>;
}
