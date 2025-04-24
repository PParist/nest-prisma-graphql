import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  await prisma.rolePermissions.deleteMany();
  await prisma.userAccounts.deleteMany();
  await prisma.permissions.deleteMany();
  await prisma.roles.deleteMany();

  console.log('Seeding...');

  const adminRole = await prisma.roles.create({
    data: {
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      name: 'admin',
      description: 'Admin user account',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  const userRole = await prisma.roles.create({
    data: {
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      name: 'user',
      description: 'user account',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  const managerRole = await prisma.roles.create({
    data: {
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      name: 'manager',
      description: 'Manager user account',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  const guestRole = await prisma.roles.create({
    data: {
      uuid: '550e8400-e29b-41d4-a716-446655440003',
      name: 'guest',
      description: 'Guest user account',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  console.log('Created role:', { userRole, adminRole, managerRole, guestRole });

  const createPermission = await prisma.permissions.create({
    data: {
      uuid: '550e8400-e29b-41d4-a716-446655442001',
      name: 'create',
      code: 'CREATE',
      description: 'Can create content',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655442001',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655442001',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  const readPermission = await prisma.permissions.create({
    data: {
      uuid: '550e8400-e29b-41d4-a716-446655442002',
      name: 'read',
      code: 'READ',
      description: 'Can write content',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655442002',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655442002',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  const updatePermission = await prisma.permissions.create({
    data: {
      uuid: '550e8400-e29b-41d4-a716-446655442003',
      name: 'update',
      code: 'UPDATE',
      description: 'Can write content',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655442003',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655442003',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  const deletePermission = await prisma.permissions.create({
    data: {
      uuid: '550e8400-e29b-41d4-a716-446655442004',
      name: 'delete',
      code: 'DELETE',
      description: 'Can delete content',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655442004',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655442004',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  console.log('Created permissions:', {
    createPermission,
    readPermission,
    updatePermission,
    deletePermission,
  });

  const userReadPermission = await prisma.rolePermissions.create({
    data: {
      roleUuid: userRole.uuid,
      permissionUuid: readPermission.uuid,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  const userCreatePermission = await prisma.rolePermissions.create({
    data: {
      roleUuid: userRole.uuid,
      permissionUuid: createPermission.uuid,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  console.log('Role permissions assigned');

  const user1 = await prisma.userAccounts.create({
    data: {
      uuid: uuidv4(),
      description: 'Lisa Simpson',
      email: 'lisa@simpson.com',
      roleUuid: userRole.uuid,
      loginType: 'GOOGLE',
      loginToken: 'test',
      deviceUuid: 'test',
      ipAddress: 'test',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  const user2 = await prisma.userAccounts.create({
    data: {
      uuid: uuidv4(),
      description: 'test',
      email: 'test',
      roleUuid: adminRole.uuid,
      loginType: 'APPLE',
      loginToken: 'test',
      deviceUuid: 'test',
      ipAddress: 'test',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '0.0.1',
    },
  });

  console.log('Created user accounts:', { user1, user2 });

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
