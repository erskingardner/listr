import type { PageLoad } from './$types';
import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';

export const load = (async ({ params }) => {
    const npub = params.npub;
    const ndk = getStore(ndkStore);
    const user = ndk.getUser({ npub: npub });
    user.fetchProfile();

    return {
        user: user
    };
}) satisfies PageLoad;
