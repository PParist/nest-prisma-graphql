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
}
