import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';

const { Pool } = require('pg');

dotenv.config({ path: '.env' });

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: envFile, override: true });

const connectionString = process.env.IDENTITY_SERVICE_DATABASE_URL;

if (!connectionString) {
  throw new Error('IDENTITY_SERVICE_DATABASE_URL is required');
}

const pool = new Pool({ connectionString });

type Queryable = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>;
};

type SeedUser = {
  id: string;
  password?: string;
  role?: string;
  name: string;
  membershipLevel: string;
  age: number;
  email: string;
  phoneNumber: string;
  totalUsedPoints: number;
  availablePoints: number;
  registrationDate: string;
  totalPurchaseAmount: number;
  dashboardAccess?: boolean;
  memberAccess?: boolean;
  productAccess?: boolean;
  orderAccess?: boolean;
  recipeAccess?: boolean;
  bannerAccess?: boolean;
};

const USERS_DATA: SeedUser[] = [
  {
    id: 'user001',
    name: '김민준',
    membershipLevel: 'LV1. 씨앗',
    age: 28,
    email: 'minjun.kim@example.com',
    phoneNumber: '010-1234-5678',
    totalUsedPoints: 5000,
    availablePoints: 3000,
    registrationDate: '2023-01-15',
    totalPurchaseAmount: 150000,
  },
  {
    id: 'user002',
    name: '이서연',
    membershipLevel: 'LV2. 새싹',
    age: 32,
    email: 'seoyeon.lee@example.com',
    phoneNumber: '010-2345-6789',
    totalUsedPoints: 12000,
    availablePoints: 8000,
    registrationDate: '2022-08-20',
    totalPurchaseAmount: 320000,
  },
  {
    id: 'user003',
    name: '박지호',
    membershipLevel: 'LV3. 열매',
    age: 45,
    email: 'jiho.park@example.com',
    phoneNumber: '010-3456-7890',
    totalUsedPoints: 30000,
    availablePoints: 15000,
    registrationDate: '2021-03-10',
    totalPurchaseAmount: 580000,
  },
  {
    id: 'user004',
    name: '최수아',
    membershipLevel: 'LV4. 나무',
    age: 38,
    email: 'sua.choi@example.com',
    phoneNumber: '010-4567-8901',
    totalUsedPoints: 50000,
    availablePoints: 25000,
    registrationDate: '2020-11-05',
    totalPurchaseAmount: 920000,
  },
  {
    id: 'user005',
    name: '정도윤',
    membershipLevel: 'LV5. 정원',
    age: 52,
    email: 'doyun.jung@example.com',
    phoneNumber: '010-5678-9012',
    totalUsedPoints: 100000,
    availablePoints: 60000,
    registrationDate: '2019-06-22',
    totalPurchaseAmount: 2100000,
  },
  {
    id: 'user006',
    name: '윤하은',
    membershipLevel: 'LV1. 씨앗',
    age: 24,
    email: 'haeun.yoon@example.com',
    phoneNumber: '010-6789-0123',
    totalUsedPoints: 0,
    availablePoints: 1000,
    registrationDate: '2024-01-03',
    totalPurchaseAmount: 45000,
  },
  {
    id: 'user007',
    name: '강태양',
    membershipLevel: 'LV2. 새싹',
    age: 29,
    email: 'taeyang.kang@example.com',
    phoneNumber: '010-7890-1234',
    totalUsedPoints: 18000,
    availablePoints: 9000,
    registrationDate: '2022-05-18',
    totalPurchaseAmount: 280000,
  },
  {
    id: 'user008',
    name: '임채원',
    membershipLevel: 'LV3. 열매',
    age: 41,
    email: 'chaewon.lim@example.com',
    phoneNumber: '010-8901-2345',
    totalUsedPoints: 40000,
    availablePoints: 20000,
    registrationDate: '2021-09-14',
    totalPurchaseAmount: 650000,
  },
  {
    id: 'user009',
    name: '오소율',
    membershipLevel: 'LV1. 씨앗',
    age: 35,
    email: 'soyul.oh@example.com',
    phoneNumber: '010-9012-3456',
    totalUsedPoints: 2000,
    availablePoints: 500,
    registrationDate: '2023-07-29',
    totalPurchaseAmount: 75000,
  },
  {
    id: 'user010',
    name: '신예준',
    membershipLevel: 'LV4. 나무',
    age: 47,
    email: 'yejun.shin@example.com',
    phoneNumber: '010-0123-4567',
    totalUsedPoints: 65000,
    availablePoints: 30000,
    registrationDate: '2020-04-11',
    totalPurchaseAmount: 1100000,
  },
  {
    id: 'liflowadmin',
    password: '123456',
    name: 'Liflow Admin',
    membershipLevel: 'LV5. 정원',
    age: 30,
    email: 'liflowadmin@example.com',
    phoneNumber: '010-0000-0000',
    totalUsedPoints: 0,
    availablePoints: 0,
    registrationDate: new Date().toISOString().slice(0, 10),
    totalPurchaseAmount: 0,
    dashboardAccess: true,
    memberAccess: true,
    productAccess: true,
    orderAccess: true,
    recipeAccess: true,
    bannerAccess: true,
    role: 'ADMIN',
  },
];

const ROLES_DATA = [
  { name: 'ADMIN', description: 'Administrator' },
  { name: 'GENERAL_MANAGER', description: 'General manager' },
  { name: 'MANAGER', description: 'Manager' },
  { name: 'MD', description: 'Merchandiser' },
  { name: 'CS_MANAGER', description: 'Customer service manager' },
  { name: 'USER', description: 'Default user' },
] as const;

async function seedRoles(db: Queryable) {
  console.log('\n[1/3] Seeding roles...');

  const roleIds = new Map<string, string>();

  for (const role of ROLES_DATA) {
    const result = await db.query(
      `
        INSERT INTO "roles" ("id", "name", "description", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT ("name") DO UPDATE
        SET "description" = EXCLUDED."description",
            "updatedAt" = NOW()
        RETURNING "id"
      `,
      [randomUUID(), role.name, role.description],
    );

    roleIds.set(role.name, result.rows[0].id);
    console.log(`  - ${role.name}`);
  }

  return roleIds;
}

async function seedUsers(db: Queryable) {
  console.log('\n[2/3] Seeding users...');

  for (const user of USERS_DATA) {
    const password = user.password
      ? await bcrypt.hash(user.password, 10)
      : null;

    await db.query(
      `
        INSERT INTO "users" (
          "id",
          "password",
          "name",
          "membership_level",
          "age",
          "email",
          "phone_number",
          "total_used_points",
          "available_points",
          "registration_date",
          "total_purchase_amount",
          "dashboard_access",
          "member_access",
          "product_access",
          "order_access",
          "recipe_access",
          "banner_access",
          "created_at",
          "updated_at"
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
        )
        ON CONFLICT ("id") DO UPDATE
        SET "password" = COALESCE(EXCLUDED."password", "users"."password"),
            "name" = EXCLUDED."name",
            "membership_level" = EXCLUDED."membership_level",
            "age" = EXCLUDED."age",
            "email" = EXCLUDED."email",
            "phone_number" = EXCLUDED."phone_number",
            "total_used_points" = EXCLUDED."total_used_points",
            "available_points" = EXCLUDED."available_points",
            "registration_date" = EXCLUDED."registration_date",
            "total_purchase_amount" = EXCLUDED."total_purchase_amount",
            "dashboard_access" = EXCLUDED."dashboard_access",
            "member_access" = EXCLUDED."member_access",
            "product_access" = EXCLUDED."product_access",
            "order_access" = EXCLUDED."order_access",
            "recipe_access" = EXCLUDED."recipe_access",
            "banner_access" = EXCLUDED."banner_access",
            "updated_at" = NOW()
      `,
      [
        user.id,
        password,
        user.name,
        user.membershipLevel,
        user.age,
        user.email,
        user.phoneNumber,
        user.totalUsedPoints,
        user.availablePoints,
        user.registrationDate,
        user.totalPurchaseAmount,
        user.dashboardAccess ?? false,
        user.memberAccess ?? false,
        user.productAccess ?? false,
        user.orderAccess ?? false,
        user.recipeAccess ?? false,
        user.bannerAccess ?? false,
      ],
    );
    console.log(`  - ${user.id}`);
  }
}

async function seedUserRoles(db: Queryable, roleIds: Map<string, string>) {
  console.log('\n[3/3] Seeding user roles...');

  for (const user of USERS_DATA) {
    const roleName = user.role ?? 'USER';
    const roleId = roleIds.get(roleName);

    if (!roleId) {
      throw new Error(`Role "${roleName}" not found`);
    }

    await db.query('DELETE FROM "user_roles" WHERE "userId" = $1', [user.id]);
    await db.query(
      `
        INSERT INTO "user_roles" ("userId", "roleId", "createdAt", "updatedAt")
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT ("userId", "roleId") DO NOTHING
      `,
      [user.id, roleId],
    );
    console.log(`  - ${user.id} -> ${roleName}`);
  }
}

async function main() {
  console.log('Starting identity-service seed...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const roleIds = await seedRoles(client);
    await seedUsers(client);
    await seedUserRoles(client, roleIds);
    await client.query('COMMIT');

    console.log('\nIdentity-service seed completed');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error('Identity-service seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
