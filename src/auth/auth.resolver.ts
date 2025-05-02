import {
  Resolver,
  Mutation,
  Args,
  Parent,
  ResolveField,
  Context,
} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './models/auth.model';
import { Token } from './models/token.model';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { UserAccount } from '../users/models/user.model';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => Auth)
  async register(@Args('data') data: RegisterInput, @Context() context) {
    data.email = data.email.toLowerCase();
    data.ip_address = this.getIpAddress(context.req);
    const { user, accessToken, refreshToken } =
      await this.auth.createUser(data);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Mutation(() => Auth)
  async login(@Args('data') loginInput: LoginInput, @Context() context) {
    loginInput.ip_address = this.getIpAddress(context.req);
    const { accessToken, refreshToken } = await this.auth.login(loginInput);
    return {
      accessToken,
      refreshToken,
    };
  }

  @Mutation(() => Token)
  async refreshToken(@Args() { token }: RefreshTokenInput) {
    return this.auth.refreshToken(token);
  }

  @ResolveField('user_account', () => UserAccount)
  async user(@Parent() auth: Auth) {
    return await this.auth.getUserFromToken(auth.accessToken);
  }

  private getIpAddress(request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];

    if (xForwardedFor) {
      const ips = xForwardedFor.split(',');
      return ips[0].trim();
    }

    return (
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      '0.0.0.0'
    );
  }
}
