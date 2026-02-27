import { sessions } from '$lib/server/db/schema';
import { db } from '$lib/server/db/index';
import { createHash, randomUUID } from 'crypto';
import { ForeignKeyError } from '$lib/server/db/errors';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import * as Postgres from 'postgres';
import { PG_ERROR } from '$lib/server/db/pg-errors-enum';

// TODO make session time configurable in .yaml file or something
export const SESSION_TIME_IN_MS = 1000 * 60 * 60 * 2;
// 1000 * 60 * 60 * 2

/**
 * Creates a session and returns a token
 *
 * @param userId - id of the user to create the session for
 * @returns The users auth token
 */
export async function createSession(userId: string) {
	const token = randomUUID();
	const id = createHash('sha256').update(token).digest('hex');
	const now = Date.now();
	const expiresAt = new Date(now + SESSION_TIME_IN_MS);

	const session: typeof sessions.$inferInsert = { id, userId, expiresAt };

	try {
		await db.insert(sessions).values(session);
	} catch (err) {
		if (err instanceof DrizzleQueryError) {
			const cause = err.cause;
			if (cause && cause instanceof Postgres.PostgresError) {
				if (cause.code === PG_ERROR.FOREIGN_KEY_VIOLATION) {
					throw new ForeignKeyError('Foreign key error!', {
						constraintName: cause.constraint_name,
						offendingData: userId,
					});
				}
			}
		} else {
			console.error('Unknown error', err);
			throw new Error('Unknown error creating session');
		}
	}

	return token;
}

export async function validateSession(token: string) {
	const hashedToken = createHash('sha256').update(token).digest('hex');
	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, hashedToken),
		with: {
			user: true,
		},
	});

	if (!session) {
		return null;
	}

	if (Date.now() > session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, hashedToken));
		console.log('deleted session');
		return null;
	}

	return session;
}
