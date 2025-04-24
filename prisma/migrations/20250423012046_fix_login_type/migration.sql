/*
  Warnings:

  - Changed the type of `login_type` on the `user_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('NONE', 'GOOGLE', 'APPLE', 'FACEBOOK', 'HUAWEI' , 'GUEST');

-- AlterTable
ALTER TABLE "user_accounts" DROP COLUMN "login_type",
ADD COLUMN     "login_type" "LoginType" NOT NULL;
