import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import type NDK from '@nostr-dev-kit/ndk';
import type { NDKFilter, NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

const TextEventsInterface = {
    get: (user?: NDKUser) => {
        const filter: NDKFilter = { kinds: [1] };
        if (user) filter.authors = [user.hexpubkey()];
        const ndk: NDK = getStore(ndkStore);
        const subs = ndk.subscribe(filter);

        subs.on('event', async (event: NDKEvent) => {
            // Do something
        });
    }
};

export default TextEventsInterface;
