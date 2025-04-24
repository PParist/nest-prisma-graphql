import { PrismaService } from 'nestjs-prisma';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { UserAccount } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService, // private passwordService: PasswordService,
  ) {}

  updateUser(userUuid: string, newUserData: UpdateUserInput) {
    return this.prisma.userAccounts.update({
      data: newUserData,
      where: {
        uuid: userUuid,
      },
    });
  }

  async findOneUser(userUuid: string): Promise<UserAccount> {
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
  }

  // async changePassword(
  //   userId: string,
  //   userPassword: string,
  //   changePassword: ChangePasswordInput,
  // ) {
  //   const passwordValid = await this.passwordService.validatePassword(
  //     changePassword.oldPassword,
  //     userPassword,
  //   );

  //   if (!passwordValid) {
  //     throw new BadRequestException('Invalid password');
  //   }

  //   const hashedPassword = await this.passwordService.hashPassword(
  //     changePassword.newPassword,
  //   );

  //   return this.prisma.user.update({
  //     data: {
  //       password: hashedPassword,
  //     },
  //     where: { id: userId },
  //   });
  // }
}
