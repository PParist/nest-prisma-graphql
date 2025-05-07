import { PrismaService } from 'nestjs-prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { UserAccount } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService, // private passwordService: PasswordService,
  ) {}

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
        data: {
          ...newUserData,
          // Increment version to track changes
          version: {
            increment: 1,
          },
        },
        where: {
          uuid: userUuid,
        },
      });

      // Convert to UserAccount model
      const user = new UserAccount();
      user.id = updatedUser.id;
      user.uuid = updatedUser.uuid;
      user.description = updatedUser.description;
      user.email = updatedUser.email;
      user.login_type = updatedUser.loginType;
      user.role_uuid = updatedUser.roleUuid;
      user.createdAt = updatedUser.createdAt;
      user.updatedAt = updatedUser.updatedAt;
      user.deletedAt = updatedUser.deletedAt;
      user.deletedBy = updatedUser.deletedBy;
      user.createdBy = updatedUser.createdBy;
      user.updatedBy = updatedUser.updatedBy;
      user.version = updatedUser.version;

      return user;
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

      const userModel = await this.prisma.userAccounts.findUnique({
        where: { uuid: userUuid },
      });

      if (!userModel) {
        throw new NotFoundException('User not found');
      }

      const user = new UserAccount();
      user.id = userModel.id;
      user.uuid = userModel.uuid;
      user.email = userModel.email;
      user.login_type = userModel.loginType;
      user.role_uuid = userModel.roleUuid;
      user.createdAt = userModel.createdAt;
      user.updatedAt = userModel.updatedAt;
      user.deletedAt = userModel.deletedAt;
      user.deletedBy = userModel.deletedBy;
      user.createdBy = userModel.createdBy;
      user.updatedBy = userModel.updatedBy;
      user.version = userModel.version;

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to find user: ${error.message}`);
    }
  }

  async findAllUsers(): Promise<UserAccount[]> {
    try {
      const userModels = await this.prisma.userAccounts.findMany({
        where: {
          deletedAt: null,
        },
      });

      return userModels.map((userModel) => {
        const user = new UserAccount();
        user.id = userModel.id;
        user.uuid = userModel.uuid;
        user.email = userModel.email;
        user.login_type = userModel.loginType;
        user.role_uuid = userModel.roleUuid;
        user.createdAt = userModel.createdAt;
        user.updatedAt = userModel.updatedAt;
        user.deletedAt = userModel.deletedAt;
        user.deletedBy = userModel.deletedBy;
        user.createdBy = userModel.createdBy;
        user.updatedBy = userModel.updatedBy;
        user.version = userModel.version;

        return user;
      });
    } catch (error) {
      throw new BadRequestException(`Failed to find users: ${error.message}`);
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

      // Convert to UserAccount model
      const user = new UserAccount();
      user.id = deletedUser.id;
      user.uuid = deletedUser.uuid;
      user.email = deletedUser.email;
      user.login_type = deletedUser.loginType;
      user.role_uuid = deletedUser.roleUuid;
      user.createdAt = deletedUser.createdAt;
      user.updatedAt = deletedUser.updatedAt;
      user.deletedAt = deletedUser.deletedAt;
      user.deletedBy = deletedUser.deletedBy;
      user.createdBy = deletedUser.createdBy;
      user.updatedBy = deletedUser.updatedBy;
      user.version = deletedUser.version;

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete user: ${error.message}`);
    }
  }
}
