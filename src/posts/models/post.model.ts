import { Field, ObjectType } from '@nestjs/graphql';
import { UserAccount } from '../../users/models/user.model';
import { BaseModel } from '../../common/models/base.model';

@ObjectType()
export class Post extends BaseModel {
  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => Boolean)
  published: boolean;

  @Field(() => UserAccount, { nullable: true })
  author?: UserAccount | null;
}
