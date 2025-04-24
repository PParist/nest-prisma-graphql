import { ObjectType, Field } from '@nestjs/graphql';
import { BaseModel } from 'src/common/models/base.model';

@ObjectType()
export class Role extends BaseModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;
}
