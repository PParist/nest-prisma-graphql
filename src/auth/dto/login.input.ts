import { IsEmail, IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

import { LoginType } from '@prisma/client';
@InputType()
export class LoginInput {
  @Field({ nullable: true })
  uuid?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  login_token: string;

  @Field(() => LoginType)
  login_type: LoginType;

  @Field()
  device_uuid: string;

  @Field({ nullable: true })
  ip_address?: string;

  @Field({ nullable: true })
  role?: string;

  @Field()
  version?: number;
}
