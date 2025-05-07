// src/auth/gql-auth.guard.ts
import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Role } from '../common/graphql/enums';
import { ROLES_KEY } from '../common/decorators/roles.decorator';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = this.getRequest(context);
    const { user } = request;

    return requiredRoles.some((role) => user.roles.name === role);
  }
}
