import type { PageLoad } from './$types';
import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import ReplaceableListInterface from '$lib/interfaces/replaceableLists';

export const load = (async ({ params }) => {
    const npub = params.npub;
    const ndk = getStore(ndkStore);
    const user = ndk.getUser({ npub: npub });
    user.fetchProfile();

    ReplaceableListInterface.getForUser({ hexpubkey: user.hexpubkey() });

    return {
        user: user
    };
}) satisfies PageLoad;
