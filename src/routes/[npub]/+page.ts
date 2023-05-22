import type { PageLoad } from './$types';
import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import ListInterface from '$lib/interfaces/lists';
import UserInterface from '$lib/interfaces/users';

export const load = (async ({ params }) => {
    const npub = params.npub;
    const ndk = getStore(ndkStore);
    const ndkUser = ndk.getUser({ npub: npub });
    const hexpub = ndkUser.hexpubkey();
    const user = UserInterface.get({ hexpubkey: hexpub });
    const lists = ListInterface.getForUser({ hexpubkey: hexpub });

    return {
        user: user,
        lists: lists
    };
}) satisfies PageLoad;
