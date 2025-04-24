import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';
import { LoginType } from '@prisma/client';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field({ nullable: true })
  description?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  login_token: string;

  @Field(() => LoginType)
  login_type: LoginType;

  @Field({ nullable: true })
  device_uuid?: string;

  @Field({ nullable: true })
  ip_address?: string;

  @Field({ nullable: true })
  @IsUUID()
  role_uuid?: string;

  @Field()
  version: string;
}
