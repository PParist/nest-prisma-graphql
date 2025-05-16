export interface JwtDto {
  userUuid: string;
  deviceUuid: string;
  /**
   * Issued at
   */
  iat: number;
  /**
   * Expiration time
   */
  exp: number;
  /**
   * role
   */
  role: string;
}
