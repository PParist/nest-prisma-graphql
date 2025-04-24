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
import { Role } from 'src/roles/entities/role.entity';
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserAccount)
  async updateUser(
    @UserEntity() user: UserAccount,
    @Args('data') newUserData: UpdateUserInput,
  ) {
    return this.usersService.updateUser(user.uuid, newUserData);
  }

  @ResolveField(() => Role)
  role(@Parent() user: UserAccount) {
    return this.prisma.userAccounts
      .findUnique({ where: { uuid: user.uuid } })
      .roles();
  }
}
