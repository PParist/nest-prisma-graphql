import 'reflect-metadata';
import { ObjectType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { BaseModel } from '../../common/models/base.model';
import { LoginType } from '@prisma/client';

@ObjectType()
export class UserAccount extends BaseModel {
  @Field({ nullable: true })
  id: number;

  @Field({ nullable: true })
  uuid: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => LoginType, { nullable: true })
  login_type: LoginType;

  @Field({ nullable: true })
  role_uuid?: string;

  static parse(userModel: any): UserAccount {
    if (!userModel) return null;
    const user = new UserAccount();
    user.id = userModel.id;
    user.uuid = userModel.uuid;
    user.email = userModel.email;
    user.description = userModel.description;
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
}
