import type { Config } from './config.interface';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Config => {
  return {
    nest: {
      port: parseInt(process.env.PORT || '3000', 10),
    },
    cors: {
      enabled: process.env.CORS_ENABLED === 'true',
    },
    swagger: {
      enabled: process.env.SWAGGER_ENABLED === 'true',
      title: process.env.SWAGGER_TITLE || 'Nestjs FTW',
      description:
        process.env.SWAGGER_DESCRIPTION || 'The nestjs API description',
      version: process.env.SWAGGER_VERSION || '1.5',
      path: process.env.SWAGGER_PATH || 'api',
    },
    graphql: {
      playgroundEnabled: false,
      debug: process.env.GRAPHQL_DEBUG === 'true',
      schemaDestination:
        process.env.GRAPHQL_SCHEMA_DESTINATION || './src/schema.graphql',
      sortSchema: process.env.GRAPHQL_SORT_SCHEMA === 'true',
      enumsConfig: {
        enableLoginType: process.env.GRAPHQL_ENUMS_LOGIN_TYPE === 'true',
      },
    },
    security: {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshIn: process.env.JWT_REFRESH_IN || '7d',
      bcryptSaltOrRound: parseInt(process.env.BCRYPT_SALT || '10', 10),
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      tls: process.env.REDIS_TLS === 'true',
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    },
  };
});
