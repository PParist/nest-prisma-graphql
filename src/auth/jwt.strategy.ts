import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserAccounts } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtDto } from './dto/jwt.dto';
import { CacheLayerService } from '../cache/cache-layer.service';
import { CACHE_KEYS, CACHE_TTL } from '@common/constans/cache';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService,
    private cacheService: CacheLayerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtDto): Promise<UserAccounts> {
    const user = await this.authService.validateUser(payload.userUuid);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.deviceUuid !== payload.deviceUuid) {
      throw new UnauthorizedException('Invalid device');
    }
    return user;
  }
}
