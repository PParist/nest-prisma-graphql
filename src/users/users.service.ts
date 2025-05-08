import { PrismaService } from 'nestjs-prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { UserAccount } from './models/user.model';
import {
  OptionalPaginationArgs,
  PaginatedUserAccounts,
} from './users.resolver';
import { CacheLayerService } from '../cache/cache-layer.service';
import { CACHE_KEYS, CACHE_TTL, PERFIX } from '@common/constans/cache';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheLayerService,
  ) {}

  private getUserAccountCacheKey(uuid: string): string {
    return CACHE_KEYS.USERACCOUNT(uuid);
  }

  private getListCacheKey(options?: OptionalPaginationArgs): string {
    if (!options) return CACHE_KEYS.ALL_USERACCOUNTS;

    const {
      page = 1,
      limit = 100,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
    } = options;
    return `${PERFIX.USER_ACCOUNTS_LIST}:${page}:${limit}:${orderBy}:${orderDirection}`;
  }

  async updateUser(
    userUuid: string,
    newUserData: UpdateUserInput,
  ): Promise<UserAccount> {
    try {
      if (!newUserData || Object.keys(newUserData).length === 0) {
        throw new BadRequestException('No data for update');
      }
      if (newUserData.email) {
        const existingUser = await this.prisma.userAccounts.findFirst({
          where: {
            email: newUserData.email,
            uuid: { not: userUuid },
          },
        });

        if (existingUser) {
          throw new BadRequestException('Email already in use');
        }
      }

      const updatedUser = await this.prisma.userAccounts.update({
        where: {
          uuid: userUuid,
        },
        data: {
          ...newUserData,
          updatedAt: new Date(),
          updatedBy: userUuid,
          version: {
            increment: 1,
          },
        },
      });
      await Promise.all([
        this.cacheService.invalidate(CACHE_KEYS.USERACCOUNT(userUuid)),
        this.cacheService.invalidatePattern(`${PERFIX.ALL_USER_ACCOUNTS}*`),
      ]);

      return UserAccount.parse(updatedUser);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }
  }

  async findOneUser(userUuid: string): Promise<UserAccount> {
    try {
      if (!userUuid) {
        throw new BadRequestException('User UUID is required');
      }

      const cacheKey = this.getUserAccountCacheKey(userUuid);

      return this.cacheService.get<UserAccount>(
        cacheKey,
        async () => {
          const userModel = await this.prisma.userAccounts.findUnique({
            where: { uuid: userUuid },
          });

          if (!userModel) {
            throw new NotFoundException('User not found');
          }

          return UserAccount.parse(userModel);
        },
        CACHE_TTL.USER_ACCOUNT,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to find user: ${error.message}`);
    }
  }

  async findAllUsers(): Promise<UserAccount[]> {
    try {
      const result = await this.cacheService.get<PaginatedUserAccounts>(
        CACHE_KEYS.ALL_USERACCOUNTS,
        async () => {
          const userModels = await this.prisma.userAccounts.findMany({
            where: {
              deletedAt: null,
            },
            orderBy: { updatedAt: 'desc' },
          });

          const totalCount = await this.prisma.userAccounts.count({
            where: { deletedAt: null },
          });

          return {
            data: userModels.map((model) => UserAccount.parse(model)),
            meta: {
              total: totalCount,
              page: 1,
              limit: totalCount,
              pages: 1,
            },
          };
        },
        CACHE_TTL.ALL_USER_ACCOUNTS,
      );

      return result.data;
    } catch (error) {
      throw new BadRequestException(`Failed to find users: ${error.message}`);
    }
  }

  async findAllUsersWithOptions(
    options: OptionalPaginationArgs,
  ): Promise<PaginatedUserAccounts> {
    try {
      const cacheKey = this.getListCacheKey(options);

      return this.cacheService.get<PaginatedUserAccounts>(
        cacheKey,
        async () => {
          const {
            page = 1,
            limit = 100,
            orderBy = 'updatedAt',
            orderDirection = 'desc',
          } = options;

          const skip = (page - 1) * limit;
          const orderOption = {};
          orderOption[orderBy] = orderDirection;

          const [users, totalCount] = await Promise.all([
            this.prisma.userAccounts.findMany({
              skip,
              take: limit,
              orderBy: orderOption,
              where: { deletedAt: null },
            }),
            this.prisma.userAccounts.count({
              where: { deletedAt: null },
            }),
          ]);

          return {
            data: users.map((model) => UserAccount.parse(model)),
            meta: {
              total: totalCount,
              page,
              limit,
              pages: Math.ceil(totalCount / limit),
            },
          };
        },
        CACHE_TTL.ALL_USER_ACCOUNTS,
      );
    } catch (error) {
      console.error('Error in findAllUsersWithOptions:', error);
      throw new BadRequestException(
        `Failed to find users with options: ${error.message}`,
      );
    }
  }

  async deleteUser(
    userUuid: string,
    deletedByUuid: string,
  ): Promise<UserAccount> {
    try {
      // Check if the user exists
      const existingUser = await this.prisma.userAccounts.findUnique({
        where: { uuid: userUuid },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Soft delete - update deletedAt and deletedBy fields
      const deletedUser = await this.prisma.userAccounts.update({
        where: { uuid: userUuid },
        data: {
          deletedAt: new Date(),
          deletedBy: deletedByUuid,
          // Increment version to track changes
          version: {
            increment: 1,
          },
        },
      });

      await Promise.all([
        this.cacheService.invalidate(CACHE_KEYS.USERACCOUNT(userUuid)),
        this.cacheService.invalidatePattern(`${PERFIX.ALL_USER_ACCOUNTS}*`),
        this.cacheService.invalidatePattern(`${PERFIX.USER_ACCOUNTS_LIST}*`),
      ]);

      return UserAccount.parse(deletedUser);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete user: ${error.message}`);
    }
  }
}
