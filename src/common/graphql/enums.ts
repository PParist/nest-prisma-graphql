import { registerEnumType } from '@nestjs/graphql';
import { LoginType } from '@prisma/client';
import { GraphqlConfig } from '../configs/config.interface';

export function registerGraphQLEnums(config?: GraphqlConfig) {
  if (!config || config.enumsConfig?.enableLoginType !== false) {
    registerEnumType(LoginType, {
      name: 'LoginType',
      description: 'Types of login methods',
    });
  }
}
