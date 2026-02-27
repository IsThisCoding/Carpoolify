import type { PageServerLoad } from './login/$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionToken = cookies.get('sessionToken');

	cookies.set('sessionToken', 'true', { path: '/' });

	return {
		sessionToken: sessionToken === 'true',
	};
};
