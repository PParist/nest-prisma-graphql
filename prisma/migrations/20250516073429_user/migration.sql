-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "developer";

-- CreateEnum
CREATE TYPE "developer"."LoginType" AS ENUM ('NONE', 'GOOGLE', 'FACEBOOK', 'APPLE', 'HUAWEI', 'GUEST');

-- CreateTable
CREATE TABLE "developer"."permissions" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer"."role_permissions" (
    "id" SERIAL NOT NULL,
    "role_uuid" TEXT NOT NULL,
    "permission_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer"."roles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer"."user_accounts" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "role_uuid" TEXT,
    "login_type" "developer"."LoginType" NOT NULL,
    "login_token" TEXT NOT NULL,
    "device_uuid" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_uuid_key" ON "developer"."permissions"("uuid");

-- CreateIndex
CREATE INDEX "permissions_uuid_idx" ON "developer"."permissions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uuid_key" ON "developer"."roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "developer"."roles"("name");

-- CreateIndex
CREATE INDEX "roles_uuid_idx" ON "developer"."roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_uuid_key" ON "developer"."user_accounts"("uuid");

-- CreateIndex
CREATE INDEX "user_accounts_uuid_idx" ON "developer"."user_accounts"("uuid");

-- CreateIndex
CREATE INDEX "user_accounts_email_idx" ON "developer"."user_accounts"("email");

-- CreateIndex
CREATE INDEX "user_accounts_role_uuid_idx" ON "developer"."user_accounts"("role_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_email_login_type_key" ON "developer"."user_accounts"("email", "login_type");

-- AddForeignKey
ALTER TABLE "developer"."role_permissions" ADD CONSTRAINT "role_permissions_permission_uuid_fkey" FOREIGN KEY ("permission_uuid") REFERENCES "developer"."permissions"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer"."role_permissions" ADD CONSTRAINT "role_permissions_role_uuid_fkey" FOREIGN KEY ("role_uuid") REFERENCES "developer"."roles"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer"."user_accounts" ADD CONSTRAINT "user_accounts_role_uuid_fkey" FOREIGN KEY ("role_uuid") REFERENCES "developer"."roles"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
