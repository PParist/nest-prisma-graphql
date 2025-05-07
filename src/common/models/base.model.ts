import { Field, ObjectType, ID, Int } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseModel {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  uuid: string;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => String, { nullable: true })
  createdBy?: string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => String, { nullable: true })
  updatedBy?: string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => String, { nullable: true })
  deletedBy?: string;

  @Field(() => Number, { nullable: true })
  version?: number;
}
