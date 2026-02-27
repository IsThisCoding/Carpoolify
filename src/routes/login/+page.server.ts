import { checkUsersPasswordByName } from '$lib/server/db/utils/users';
import type { Actions } from './$types';
import { createSession, SESSION_TIME_IN_MS } from '$lib/server/db/utils/sessions';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const name = formData.get('username') as string;
		const password = formData.get('password') as string;
		const user = await checkUsersPasswordByName(name, password);
		if (user) {
			const token = await createSession(user.id);

			cookies.set('session', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: SESSION_TIME_IN_MS,
			});

			throw redirect(303, '/dashboard');
		}
	},
};
