import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import { liveQuery, type Observable } from 'dexie';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

const NoteInterface = {
    getNotesForUsers: (userIds: string[]): Observable<NDKEvent[]> => {
        const ndk = getStore(ndkStore);
        const notes = ndk
            .fetchEvents({ kinds: [1], authors: userIds })
            .then((events: Set<NDKEvent>) => {
                return Array.from(events).sort(
                    (a, b) => (b.created_at as number) - (a.created_at as number)
                );
            });

        return liveQuery(() => notes) as Observable<NDKEvent[]>;
    },
    getNote: (noteId: string): Observable<NDKEvent> => {
        const ndk = getStore(ndkStore);
        const note = ndk.fetchEvent({ ids: [noteId] });
        return liveQuery(() => note) as Observable<NDKEvent>;
    }
};

export default NoteInterface;
