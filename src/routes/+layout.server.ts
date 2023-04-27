import type { LayoutServerLoad } from './$types';
import { loadFlashMessage } from 'sveltekit-flash-message/server';
import { redirect } from 'sveltekit-flash-message/server';

export const load = loadFlashMessage(async (event) => {
    const userCookie = event.cookies.get('userNpub');

    if (!userCookie && event.request.url.match('/new')) {
        const message = { type: 'error', message: 'You need to log in to create lists' } as const;
        throw redirect(303, '/', message, event);
    }
}) satisfies LayoutServerLoad;
