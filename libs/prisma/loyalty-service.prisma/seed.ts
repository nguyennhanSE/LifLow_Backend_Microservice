import * as dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';

const { Pool } = require('pg');

dotenv.config({ path: '.env' });

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: envFile, override: true });

const connectionString = process.env.LOYALTY_SERVICE_DATABASE_URL;

if (!connectionString) {
  throw new Error('LOYALTY_SERVICE_DATABASE_URL is required');
}

const pool = new Pool({ connectionString });

type Queryable = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>;
};

const USERS_DATA = [
  {
    id: 'user001',
    membershipLevel: 'LV1. 씨앗',
  },
  {
    id: 'user002',
    membershipLevel: 'LV2. 새싹',
  },
  {
    id: 'user003',
    membershipLevel: 'LV3. 열매',
  },
  {
    id: 'user004',
    membershipLevel: 'LV4. 나무',
  },
  {
    id: 'user005',
    membershipLevel: 'LV5. 정원',
  },
  {
    id: 'user006',
    membershipLevel: 'LV1. 씨앗',
  },
  {
    id: 'user007',
    membershipLevel: 'LV2. 새싹',
  },
  {
    id: 'user008',
    membershipLevel: 'LV3. 열매',
  },
  {
    id: 'user009',
    membershipLevel: 'LV1. 씨앗',
  },
  {
    id: 'user010',
    membershipLevel: 'LV4. 나무',
  },
  {
    id: 'liflowadmin',
    membershipLevel: 'LV5. 정원',
  },
] as const;

const MEMBERSHIPS_DATA = [
  { name: 'LV1. 씨앗', description: null, minPrice: 0 },
  { name: 'LV2. 새싹', description: null, minPrice: 150000 },
  { name: 'LV3. 열매', description: null, minPrice: 300000 },
  { name: 'LV4. 나무', description: null, minPrice: 500000 },
  { name: 'LV5. 정원', description: null, minPrice: 1000000 },
] as const;

async function seedMemberships(db: Queryable) {
  console.log('\n[1/2] Seeding memberships...');

  const membershipIds = new Map<string, string>();

  for (const membership of MEMBERSHIPS_DATA) {
    const result = await db.query(
      `
        INSERT INTO "memberships" (
          "id",
          "name",
          "description",
          "min_price",
          "created_at",
          "updated_at"
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT ("name") DO UPDATE
        SET "description" = EXCLUDED."description",
            "min_price" = EXCLUDED."min_price",
            "updated_at" = NOW()
        RETURNING "id"
      `,
      [
        randomUUID(),
        membership.name,
        membership.description,
        membership.minPrice,
      ],
    );

    membershipIds.set(membership.name, result.rows[0].id);
    console.log(
      `  - ${membership.name} (${membership.minPrice.toLocaleString()} KRW)`,
    );
  }

  return membershipIds;
}

async function seedUserMemberships(
  db: Queryable,
  membershipIds: Map<string, string>,
) {
  console.log('\n[2/2] Seeding user memberships...');

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  for (const user of USERS_DATA) {
    const membershipId = membershipIds.get(user.membershipLevel);

    if (!membershipId) {
      throw new Error(`Membership "${user.membershipLevel}" not found`);
    }

    const membership = MEMBERSHIPS_DATA.find(
      (item) => item.name === user.membershipLevel,
    );

    await db.query(
      `
        INSERT INTO "user_memberships" (
          "id",
          "user_id",
          "membership_id",
          "membership_name",
          "membership_description",
          "status",
          "start_date",
          "end_date",
          "updated_by_admin",
          "created_at",
          "updated_at"
        )
        VALUES ($1, $2, $3, $4, $5, 'normal', $6, $7, false, NOW(), NOW())
        ON CONFLICT ("user_id") DO UPDATE
        SET "membership_id" = EXCLUDED."membership_id",
            "membership_name" = EXCLUDED."membership_name",
            "membership_description" = EXCLUDED."membership_description",
            "status" = 'normal',
            "end_date" = EXCLUDED."end_date",
            "updated_at" = NOW()
      `,
      [
        randomUUID(),
        user.id,
        membershipId,
        user.membershipLevel,
        membership?.description ?? '',
        startDate,
        endDate,
      ],
    );
    console.log(`  - ${user.id} -> ${user.membershipLevel}`);
  }
}

async function main() {
  console.log('Starting loyalty-service seed...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const membershipIds = await seedMemberships(client);
    await seedUserMemberships(client, membershipIds);
    await client.query('COMMIT');

    console.log('\nLoyalty-service seed completed');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error('Loyalty-service seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
