import { PrismaService } from 'nestjs-prisma';
import {
  Resolver,
  Query,
  Parent,
  Mutation,
  Args,
  ResolveField,
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
