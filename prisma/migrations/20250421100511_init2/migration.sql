-- DropForeignKey
ALTER TABLE "user_accounts" DROP CONSTRAINT "user_accounts_role_uuid_fkey";

-- AlterTable
ALTER TABLE "user_accounts" ALTER COLUMN "role_uuid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_role_uuid_fkey" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
