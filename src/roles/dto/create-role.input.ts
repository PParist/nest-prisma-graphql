import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  uuid: string;

  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  version: string;
}
