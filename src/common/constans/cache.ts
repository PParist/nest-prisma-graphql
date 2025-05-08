// Cache constants
export const CACHE_TTL = {
  USER_ACCOUNT: 600,
  ALL_USER_ACCOUNTS: 300,
  USER_ACCOUNTS_LIST: 180,
};

export const CACHE_KEYS = {
  ALL_USERACCOUNTS: 'user_accounts:all',
  USERACCOUNT: (uuid: string) => `user_account:${uuid}`,
  USER_ACCOUNTS_LIST: 'user_accounts:list',
};

export const PERFIX = {
  ALL_USER_ACCOUNTS: 'user_accounts:all',
  USER_ACCOUNT: (uuid: string) => `user_account:${uuid}`,
  USER_ACCOUNTS_LIST: 'user_accounts:list',
};
