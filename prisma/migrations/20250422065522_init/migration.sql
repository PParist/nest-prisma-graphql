/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `user_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "permissions" ALTER COLUMN "version" DROP DEFAULT,
ALTER COLUMN "version" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "role_permissions" ALTER COLUMN "version" DROP DEFAULT,
ALTER COLUMN "version" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "version" DROP DEFAULT,
ALTER COLUMN "version" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user_accounts" ALTER COLUMN "version" DROP DEFAULT,
ALTER COLUMN "version" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_email_key" ON "user_accounts"("email");
