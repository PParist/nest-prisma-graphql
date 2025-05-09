import { PrismaService } from 'nestjs-prisma';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, UserAccounts } from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { RegisterInput } from './dto/register.input';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { LoginInput } from './dto/login.input';
import { Constants } from 'src/common/constans/string';
import { CacheLayerService } from '../cache/cache-layer.service';
import { CACHE_KEYS, CACHE_TTL, PERFIX } from '@common/constans/cache';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private cacheService: CacheLayerService,
  ) {}

  private getUserAccountCacheKey(uuid: string): string {
    return CACHE_KEYS.USERACCOUNT(uuid);
  }

  async createUser(payload: RegisterInput): Promise<{
    user: UserAccounts;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Determine the role - default to "guest" if role is null
      const roleName = payload.role
        ? payload.role.toLowerCase()
        : Constants.ROLES.GUEST;

      // Find the role by name
      const userRole = await this.prisma.roles.findUnique({
        where: { name: roleName },
      });

      if (!userRole) {
        throw new BadRequestException(`Role "${roleName}" not found.`);
      }

      const newUuid = uuidv4();
      const newUser = await this.prisma.userAccounts.create({
        data: {
          uuid: newUuid,
          email: payload.email,
          description: payload.description,
          roleUuid: userRole.uuid, // Use the role's uuid, not the whole role object
          loginType: payload.login_type,
          loginToken: payload.login_token,
          deviceUuid: payload.device_uuid,
          ipAddress: payload.ip_address,
          createdAt: new Date(),
          createdBy: newUuid,
          updatedAt: new Date(),
          updatedBy: newUuid,
          deletedAt: null,
          deletedBy: null,
          version: 1,
        },
      });

      // Fetch the user with role information
      const userWithRole = await this.prisma.userAccounts.findUnique({
        where: { uuid: newUser.uuid },
        include: { roles: true },
      });
      const tokens = this.generateTokens({
        email: newUser.email,
        userUuid: newUser.uuid,
        role: userWithRole.roles.name,
      });
      return {
        user: newUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        console.error('Unique constraint failed:', e.message);
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e.message);
    }
  }

  async login(loginInput: LoginInput): Promise<Token> {
    try {
      if (loginInput.role) {
        const userRole = await this.prisma.roles.findUnique({
          where: { uuid: loginInput.role },
        });

        if (!userRole) {
          throw new BadRequestException('Role Not Found.');
        }
      }

      const user = await this.prisma.userAccounts.findFirst({
        where: {
          email: loginInput.email,
          loginType: loginInput.login_type,
        },
        include: {
          roles: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User Not Found.');
      }

      if (user.deviceUuid !== loginInput.device_uuid) {
        throw new UnauthorizedException(
          'Login attempt from different device detected.',
        );
      }

      return this.generateTokens({
        email: user.email,
        userUuid: user.uuid,
        role: user.roles.name,
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  validateUser(userUuid: string): Promise<UserAccounts> {
    return this.prisma.userAccounts.findUnique({
      where: { uuid: userUuid },
      include: { roles: true },
    });
  }

  getUserFromToken(token: string): Promise<UserAccounts> {
    const uuid = this.jwtService.decode(token)['userUuid'];
    return this.prisma.userAccounts.findUnique({ where: { uuid } });
  }

  generateTokens(payload: {
    email: string;
    userUuid: string;
    role: string;
  }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: {
    email: string;
    userUuid: string;
  }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { email: string }): string {
    const securityConfig =
      this.configService.get<SecurityConfig>('config.security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { email, userUuid, role } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        email,
        userUuid,
        role,
      });
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
