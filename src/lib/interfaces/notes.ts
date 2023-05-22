import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import { liveQuery, type Observable } from 'dexie';
import { browser } from '$app/environment';
import { db } from '$lib/interfaces/db';

const NoteInterface = {
    getNotesForUsers: (authorIds: string[]): Observable<App.User> => {
        const ndk = getStore(ndkStore);
        ndk.fetchEvents({ kinds: [1], authors: authorIds });

        return liveQuery(() =>
            browser ? db.events.where({ id: ndkUser.hexpubkey() }).first() || userForDb : userForDb
        ) as Observable<App.User>;
    }
};

export default NoteInterface;
