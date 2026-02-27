import { users, people, drivingGroups, groupMembers, sessions } from '$lib/server/db/schema';
import * as Argon2 from '@node-rs/argon2';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import { PG_ERROR } from '$lib/server/db/pg-errors-enum';
import { db } from '$lib/server/db/index';
import { InsertionConflicError, UserNotFoundError } from '$lib/server/db/errors';
import Postgres from 'postgres';

export async function createUser(username: string, email: string, password: string) {
	const passwordHash = await Argon2.hash(password);
	const user = { username, email, passwordHash };

	try {
		await db.insert(users).values(user);
		console.log(`user ${username} inserted succesfully!`);
	} catch (err) {
		if (err instanceof DrizzleQueryError) {
			const cause = err.cause;
			if (cause && cause instanceof Postgres.PostgresError) {
				if (cause.code === PG_ERROR.UNIQUE_VIOLATION)
					if (cause.constraint_name === 'users_username_unique') {
						console.log(err);
						throw new InsertionConflicError('Duplicate username', { violator: 'username' });
					} else if (cause.constraint_name === 'users_email_unique') {
						throw new InsertionConflicError('Duplicate email', { violator: 'email' });
					} else {
						throw new InsertionConflicError('Unknown unique violation', { violator: 'unknown' });
					}
			}
		}
	}
}
export async function getUserByName(username: string): Promise<typeof users.$inferSelect> {
	const userQuery = await db.query.users.findFirst({ where: eq(users.username, username) });

	if (!userQuery) {
		throw new UserNotFoundError(`User "${username}" was not found`);
	}
	console.log(`Query for user ${username} was successful!`);
	return userQuery;
}

export async function getUserByEmail(email: string): Promise<typeof users.$inferSelect> {
	const userquery = await db.query.users.findFirst({ where: eq(users.email, email) });

	if (!userquery) {
		throw new UserNotFoundError(`User with email "${email} was not found`);
	}
	console.log(`Query for email ${email} was successful!`);
	return userquery;
}

export async function checkUsersPasswordByName(username: string, password: string) {
	try {
		const user = await getUserByName(username);

		const passwordMatch = await Argon2.verify(user.passwordHash, password);
		if (passwordMatch) return user;
	} catch (err) {
		if (err instanceof UserNotFoundError) {
			throw err;
		}
	}
}
