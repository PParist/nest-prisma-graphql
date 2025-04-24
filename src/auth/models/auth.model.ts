import { ObjectType } from '@nestjs/graphql';
import { UserAccount } from '../../users/models/user.model';
import { Token } from './token.model';

@ObjectType()
export class Auth extends Token {
  user_account: UserAccount;
}
