import { IsEmail, IsNotEmpty } from 'class-validator';
import { LoginType } from '@prisma/client';
import { InputType, Field } from '@nestjs/graphql';
import { LoginInput } from './login.input';

@InputType()
export class RegisterInput {
  @Field({ nullable: true })
  description?: string;

  @Field()
  @IsEmail()
  email?: string;

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

  static toRegisterModel(userModel: LoginInput): RegisterInput {
    if (!userModel) return null;
    const model = new RegisterInput();
    model.email = userModel.email;
    model.login_token = userModel.login_token;
    model.login_type = userModel.login_type;
    model.device_uuid = userModel.device_uuid;
    model.ip_address = userModel.ip_address;
    return model;
  }
}
