import type { PageServerLoad } from './$types';
import ndkStore from '$lib/stores/ndk';
import { get } from 'svelte/store';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const ndk = get(ndkStore);
    const user = ndk.getUser({ npub: params.npub });
    const listName = params.listName;
    let kind: number;

    if (listName.toLowerCase() === 'mute') {
        kind = 10000;
    } else if (listName.toLowerCase() === 'pin') {
        kind = 10001;
    } else {
        throw redirect(303, `/${params.npub}`);
    }

    const listEvent = await ndk.fetchEvent({ kinds: [kind], authors: [user.hexpubkey()] });

    if (listEvent) {
        throw redirect(308, `/a/${listEvent.encode()}`);
    } else {
        throw redirect(303, `/${params.npub}`);
    }
};
