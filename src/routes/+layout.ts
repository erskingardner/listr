import ndkStore from '$lib/stores/ndk';
import { get } from 'svelte/store';

export async function load() {
    const ndk = get(ndkStore);
    await ndk.connect();

    return {};
}
