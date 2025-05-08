import { PrismaService } from 'nestjs-prisma';
import {
  Resolver,
  Query,
  Parent,
  Mutation,
  Args,
  ResolveField,
  ObjectType,
  Int,
  Field,
  ArgsType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from '../common/decorators/user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UsersService } from './users.service';
import { UserAccount } from './models/user.model';
import { UpdateUserInput } from './dto/update-user.input';
import { Role as RoleEntities } from 'src/roles/entities/role.entity';
import { Role } from '../common/graphql/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { OrderDirection } from '../common/order/order-direction';

@ArgsType()
export class OptionalPaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  limit?: number;

  @Field(() => String, { nullable: true, defaultValue: 'updatedAt' })
  orderBy?: string;

  @Field(() => OrderDirection, {
    nullable: true,
    defaultValue: OrderDirection.desc,
  })
  orderDirection?: OrderDirection;
}

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  pages: number;
}

@ObjectType()
export class PaginatedUserAccounts {
  @Field(() => [UserAccount])
  data: UserAccount[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
@Resolver(() => UserAccount)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Query(() => UserAccount)
  async myuser(@UserEntity() user: UserAccount): Promise<UserAccount> {
    return user;
  }

  @Query(() => UserAccount)
  async user(@Args('uuid') uuid: string): Promise<UserAccount> {
    return this.usersService.findOneUser(uuid);
  }

  @Query(() => [UserAccount])
  async users(): Promise<UserAccount[]> {
    return this.usersService.findAllUsers();
  }

  @Query(() => PaginatedUserAccounts, { name: 'paginatedUsers' })
  async findAllPaginated(@Args() paginationArgs: OptionalPaginationArgs) {
    return this.usersService.findAllUsersWithOptions(paginationArgs);
  }

  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserAccount)
  async updateUser(
    @UserEntity() user: UserAccount,
    @Args('data') newUserData: UpdateUserInput,
  ) {
    return this.usersService.updateUser(user.uuid, newUserData);
  }

  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserAccount)
  async deleteUser(
    @UserEntity() user: UserAccount,
    @Args('uuid') uuid: string,
  ) {
    return this.usersService.deleteUser(user.uuid, uuid);
  }

  @ResolveField(() => RoleEntities)
  role(@Parent() user: UserAccount) {
    return this.prisma.userAccounts
      .findUnique({ where: { uuid: user.uuid } })
      .roles();
  }
}
