// Cache constants
export const CACHE_TTL = {
  LOCAL_FINDONE: 60,
  LOCAL_FINDALL: 300,
  DISTRIBUTED_FINDONE: 600,
  DISTRIBUTED_FINDALL: 3600,
};

export const CACHE_KEYS = {
  ALL_USER_ACCOUNTS: 'user_accounts:all',
  USERACCOUNT: (uuid: string) => `user_account:${uuid}`,
  USER_ACCOUNTS_LIST: 'user_accounts:list',

  ALL_ROLES: 'roles:all',
  ROLE: (uuid: string) => `role:${uuid}`,
  ROLES_LIST: 'roles:list',
};

export const PERFIX = {
  ALL_USER_ACCOUNTS: 'user_accounts:all',
  USER_ACCOUNT: (uuid: string) => `user_account:${uuid}`,
  USER_ACCOUNTS_LIST: 'user_accounts:list',
};
