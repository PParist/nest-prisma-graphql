import { IsEmail, IsNotEmpty } from 'class-validator';
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

  @Field()
  @IsNotEmpty()
  device_uuid: string;

  @Field({ nullable: true })
  ip_address?: string;

  @Field({ nullable: true })
  role?: string;

  // @Field()
  // version: number;
}
