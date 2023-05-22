import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import type { NDKUser, GetUserParams, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { liveQuery, type Observable } from 'dexie';
import { browser } from '$app/environment';
import { db } from '$lib/interfaces/db';
import { unixTimeNow } from '$lib/utils/helpers';

const UserInterface = {
    get: (opts: GetUserParams): Observable<App.User> => {
        const ndk = getStore(ndkStore);
        const ndkUser = ndk.getUser(opts);
        let userForDb = {
            ...(ndkUser.profile || {}),
            id: ndkUser.hexpubkey(),
            lastFetched: unixTimeNow(),
            npub: ndkUser.npub,
            hexpubkey: ndkUser.hexpubkey()
        };
        ndkUser.fetchProfile().then(
            async () => {
                userForDb = { ...userForDb, ...ndkUser.profile };
                try {
                    browser ? await db.users.put(userForDb) : userForDb;
                } catch (e) {
                    console.log(e);
                }
            },
            (error) => {
                console.log(error);
            }
        );

        return liveQuery(() =>
            browser ? db.users.where({ id: ndkUser.hexpubkey() }).first() || userForDb : userForDb
        ) as Observable<App.User>;
    }
};

export function truncatedNpub(user: NDKUser): string {
    return `${user.npub.substring(0, 9)}...`;
}

export function truncatedNip05(userProfile: NDKUserProfile): string {
    if (userProfile.nip05?.substring(0, 1) === '_') {
        return userProfile.nip05.substring(2) as string;
    } else {
        return userProfile.nip05 as string;
    }
}

export default UserInterface;
