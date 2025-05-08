// src/cache/cache-layer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { LocalCacheService } from './local-cache.service';
import { DistributedCacheService } from './distributed-cache.service';

@Injectable()
export class CacheLayerService {
  private readonly logger = new Logger(CacheLayerService.name);

  constructor(
    private readonly localCache: LocalCacheService,
    private readonly distributedCache: DistributedCacheService,
  ) {}

  /**
   * ดึงข้อมูลจาก cache ตามลำดับชั้น: local -> distributed -> factory
   * @param key Cache key
   * @param factory Function ที่จะถูกเรียกเมื่อไม่พบข้อมูลใน cache
   * @param ttl Time to live in seconds (optional)
   * @returns ข้อมูลจาก cache หรือจาก factory
   */
  async get<T>(
    key: string,
    factory: () => Promise<T | null>,
    ttl: number = 600,
  ): Promise<T | null> {
    // 1. ลองดึงจาก local cache ก่อน (เร็วที่สุด)
    try {
      const localData = await this.localCache.get<T>(key);
      if (localData !== null) {
        this.logger.debug(`Cache hit (local): ${key}`);
        return localData;
      }
    } catch (error) {
      this.logger.warn(`Error getting from local cache: ${error.message}`);
    }

    // 2. ลองดึงจาก distributed cache (Redis)
    try {
      const distributedData = await this.distributedCache.get<T>(key);
      if (distributedData !== null) {
        this.logger.debug(`Cache hit (distributed): ${key}`);

        // Backfill local cache
        await this.setLocal(key, distributedData, ttl);

        return distributedData;
      }
    } catch (error) {
      this.logger.warn(
        `Error getting from distributed cache: ${error.message}`,
      );
    }

    // 3. ดึงจากฐานข้อมูลหรือแหล่งข้อมูลอื่นๆ ผ่าน factory function
    try {
      this.logger.debug(`Cache miss: ${key}, executing factory function`);
      const data = await factory();

      if (data !== null) {
        // บันทึกลงใน cache ทั้งสองระดับ
        await this.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      this.logger.error(`Error executing factory function: ${error.message}`);
      throw error;
    }
  }

  /**
   * บันทึกข้อมูลลงใน cache ทั้งสองระดับ
   * @param key Cache key
   * @param value ข้อมูลที่จะบันทึก
   * @param ttl Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl: number = 600): Promise<void> {
    // บันทึกทั้ง local และ distributed cache พร้อมกัน
    await Promise.all([
      this.setLocal(key, value, ttl),
      this.setDistributed(key, value, ttl),
    ]);
  }

  /**
   * บันทึกข้อมูลลงใน local cache
   * @param key Cache key
   * @param value ข้อมูลที่จะบันทึก
   * @param ttl Time to live in seconds (optional)
   */
  private async setLocal<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.localCache.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(`Error setting local cache: ${error.message}`);
    }
  }

  /**
   * บันทึกข้อมูลลงใน distributed cache
   * @param key Cache key
   * @param value ข้อมูลที่จะบันทึก
   * @param ttl Time to live in seconds (optional)
   */
  private async setDistributed<T>(
    key: string,
    value: T,
    ttl: number,
  ): Promise<void> {
    try {
      await this.distributedCache.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(`Error setting distributed cache: ${error.message}`);
    }
  }

  /**
   * ลบข้อมูลออกจาก cache ทั้งสองระดับ
   * @param key Cache key
   */
  async invalidate(key: string): Promise<void> {
    await Promise.all([
      this.localCache.delete(key),
      this.distributedCache.delete(key),
    ]);
  }

  /**
   * ลบข้อมูลตามรูปแบบออกจาก cache ทั้งสองระดับ
   * @param pattern Pattern ของ key ที่ต้องการลบ
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const promises = [];

    if (this.localCache.deletePattern) {
      console.log('Deleting pattern from local cache:', pattern);
      promises.push(this.localCache.deletePattern(pattern));
    }

    console.log('Deleting pattern from distributed cache:', pattern);
    promises.push(this.distributedCache.deletePattern(pattern));

    await Promise.all(promises);
  }

  /**
   * ดึงข้อมูลหลายรายการจาก cache
   * @param keys รายการ keys
   * @returns ข้อมูลที่พบใน cache
   */
  async mget<T>(keys: string[]): Promise<Record<string, T>> {
    if (!keys.length) return {};

    // ลองดึงจาก local cache ก่อน
    const localResults = await this.localCache.mget<T>(keys);

    // ตรวจสอบว่ามี keys ใดที่ไม่พบใน local cache
    const missingKeys = keys.filter((key) => !localResults[key]);

    if (missingKeys.length === 0) {
      return localResults;
    }

    // ดึง keys ที่ไม่พบจาก distributed cache
    const distributedResults = await this.distributedCache.mget<T>(missingKeys);

    // รวมผลลัพธ์
    const results = { ...localResults, ...distributedResults };

    // Backfill local cache สำหรับข้อมูลที่พบใน distributed แต่ไม่พบใน local
    const backfillEntries: Record<string, T> = {};
    for (const key of missingKeys) {
      if (distributedResults[key]) {
        backfillEntries[key] = distributedResults[key];
      }
    }

    if (Object.keys(backfillEntries).length > 0) {
      this.localCache
        .mset(backfillEntries, 600)
        .catch((err) =>
          this.logger.warn(`Error backfilling local cache: ${err.message}`),
        );
    }

    return results;
  }

  /**
   * บันทึกข้อมูลหลายรายการลงใน cache
   * @param entries ข้อมูลที่จะบันทึก
   * @param ttl Time to live in seconds (optional)
   */
  async mset<T>(entries: Record<string, T>, ttl: number = 600): Promise<void> {
    await Promise.all([
      this.localCache.mset(entries, ttl),
      this.distributedCache.mset(entries, ttl),
    ]);
  }
}
