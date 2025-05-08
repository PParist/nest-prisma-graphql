// src/cache/cache.module.ts
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { InMemoryCacheAdapter } from './adapter/in-memory-cache.adapter';
import { RedisCacheAdapter } from './adapter/redis-cache.adapter';
import { LocalCacheService } from './local-cache.service';
import { DistributedCacheService } from './distributed-cache.service';
import { RedisModule } from './redish.module';
import { ConfigModule } from '@nestjs/config';
import { CacheLayerService } from './cache-layer.service';

@Module({
  imports: [
    ConfigModule,
    NestCacheModule.register({
      ttl: 60 * 1000,
      max: 1000,
    }),
    RedisModule.registerAsync(),
  ],
  providers: [
    InMemoryCacheAdapter,
    {
      provide: 'LOCAL_CACHE_PORT',
      useExisting: InMemoryCacheAdapter,
    },
    {
      provide: LocalCacheService,
      inject: ['LOCAL_CACHE_PORT'],
      useFactory: (localCachePort) => new LocalCacheService(localCachePort),
    },

    {
      provide: 'REDIS_ADAPTER',
      inject: ['REDIS_CLIENT'],
      useFactory: (redisClient) => new RedisCacheAdapter(redisClient),
    },
    {
      provide: 'DISTRIBUTED_CACHE_PORT',
      useExisting: 'REDIS_ADAPTER',
    },
    {
      provide: DistributedCacheService,
      inject: ['DISTRIBUTED_CACHE_PORT'],
      useFactory: (distributedCachePort) =>
        new DistributedCacheService(distributedCachePort),
    },
    CacheLayerService,
  ],
  exports: [LocalCacheService, DistributedCacheService, CacheLayerService],
})
export class CacheModule {}
