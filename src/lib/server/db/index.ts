import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '$lib/server/db/schema';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { getUserByName } from './utils/users';

const connectionString = process.env.PRIVATE_DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle({ client, schema });

async function test() {
	const h = await db.query.drivingGroups.findFirst({
		where: eq(schema.sessions.userId, '123'),
		with: { passengers: true },
	});
	return h;
}

type d = typeof test;
