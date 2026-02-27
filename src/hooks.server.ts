import { validateSession } from '$lib/server/db/utils/sessions';
import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');

	if (!sessionToken) {
		event.locals.user = null;
		return resolve(event);
	}

	const session = await validateSession(sessionToken);

	if (session) {
		event.locals.user = { id: session.userId, username: session.user.username };
	} else {
		event.locals.user = null;
		event.cookies.delete('session', { path: '/' });
	}

	return resolve(event);
};
