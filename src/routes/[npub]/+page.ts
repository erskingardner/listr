import type { PageLoad } from './$types';
import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import User from '$lib/classes/user';

export const load = (async ({ params }) => {
    const npub = params.npub;
    const ndk = getStore(ndkStore);
    const ndkUser = ndk.getUser({ npub: npub });
    const hexpub = ndkUser.hexpubkey();
    const user = User.get(hexpub);

    return {
        user: user,
        pubkey: hexpub
    };
}) satisfies PageLoad;
