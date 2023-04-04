import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import type { NDKUserProfile, GetUserParams } from '@nostr-dev-kit/ndk';
import { liveQuery, type Observable } from 'dexie';
import { browser } from '$app/environment';
import { db } from '$lib/interfaces/db';

const UserInterface = {
    get: (opts: GetUserParams): Observable<NDKUserProfile> => {
        const ndk = getStore(ndkStore);
        const user = ndk.getUser(opts);
        console.log('User INTER: ', user);
        let userProfile = { ...(user.profile || {}), id: user.hexpubkey() };
        user.fetchProfile().then(async () => {
            userProfile = { ...userProfile, ...(user.profile || {}) };
            await db.users.put(userProfile);
        });

        return liveQuery(() =>
            browser ? db.users.where({ id: user.hexpubkey() }).first() || userProfile : userProfile
        ) as Observable<NDKUserProfile>;
    }
};

export default UserInterface;
