import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from 'src/common/configs/config.interface';
import Redis from 'ioredis';

@Module({})
export class RedisModule {
  static registerAsync(): DynamicModule {
    return {
      module: RedisModule,
      imports: [],
      providers: [
        {
          provide: 'REDIS_CLIENT',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const redisConfig = configService.get<RedisConfig>('config.redis');
            console.log('Redis config:', redisConfig);

            const client = new Redis({
              host: redisConfig.host,
              port: redisConfig.port,
              password: redisConfig.password,
              username: redisConfig.username,
              db: redisConfig.db || 0,
              tls: redisConfig.tls ? {} : undefined,
              retryStrategy: redisConfig.retryStrategy,
            });

            client.on('error', (err) => {
              console.error('Redis connection error:', err);
            });

            client.on('connect', () => {
              console.log('Connected to Redis');
            });

            client.on('ready', () => {
              console.log('Redis client ready');
            });

            client.on('reconnecting', () => {
              console.log('Redis client reconnecting');
              return null;
            });

            return client;
          },
        },
      ],
      exports: ['REDIS_CLIENT'],
    };
  }
}
