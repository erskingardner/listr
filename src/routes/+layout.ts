import ndkStore from '$lib/stores/ndk';
import { get } from 'svelte/store';

export async function load() {
    const ndk = get(ndkStore);
    ndk.connect().catch((e) => {
        console.error(e);
    });

    return {};
}
