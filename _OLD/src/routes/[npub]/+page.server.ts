import type { PageServerLoad } from './$types';
import ndkStore from '$lib/stores/ndk';
import { get } from 'svelte/store';

export const load: PageServerLoad = async ({ params }) => {
    const ndk = get(ndkStore);
    const user = ndk.getUser({ npub: params.npub });

    return {
        pubkey: user.hexpubkey()
    };
};
