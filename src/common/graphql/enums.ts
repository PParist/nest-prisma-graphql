import { registerEnumType } from '@nestjs/graphql';
import { LoginType } from '@prisma/client';
import { GraphqlConfig } from '../configs/config.interface';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
  IS_OWNER = 'isOwner',
}

export function registerGraphQLEnums(config?: GraphqlConfig) {
  if (!config || config.enumsConfig?.enableLoginType !== false) {
    registerEnumType(LoginType, {
      name: 'LoginType',
      description: 'Types of login methods',
    });
  }

  registerEnumType(Role, {
    name: 'Role',
    description: 'User authorization rules',
  });
}
