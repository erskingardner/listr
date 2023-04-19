import type { NDKFilter, GetUserParams } from '@nostr-dev-kit/ndk';
import type { NDKTag } from '@nostr-dev-kit/ndk/lib/src/events';
import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import { liveQuery, type Observable } from 'dexie';
import { browser } from '$app/environment';
import { db } from '$lib/interfaces/db';
import { unixTimeNow } from '$lib/utils/helpers';

const ReplaceableListInterface = {
    getForUser: (opts: GetUserParams): Observable<App.List[]> => {
        const ndk = getStore(ndkStore);
        const user = ndk.getUser(opts);
        const filter: NDKFilter = {
            kinds: [10000, 10001, 30000, 30001],
            authors: [user.hexpubkey()]
        };
        const replaceableLists: App.List[] = [];

        ndk.fetchEvents(filter).then(async (eventSet) => {
            eventSet.forEach(async (event) => {
                let listName = '';
                if (event.kind === 10000) listName = 'mute';
                if (event.kind === 10001) listName = 'pin';
                if (event.kind === 30000 || event.kind === 30001) {
                    listName = event.getMatchingTags('d')[0][1];
                }

                // Skip to next if it's a client marker list
                if (listName.endsWith('/lastOpened')) {
                    return;
                }

                const listValues: NDKTag[] = [];
                event.tags.forEach(async (tag) => {
                    if (!(tag[0] === 'd')) {
                        listValues.push(tag);
                    }
                });

                const listItem: App.List = {
                    id: event.id,
                    kind: event.kind as number,
                    createdAt: event.created_at as number,
                    name: listName,
                    authorHexPubkey: user.hexpubkey(),
                    publicItems: listValues,
                    lastFetched: unixTimeNow()
                };
                try {
                    if (browser) {
                        db.lists
                            .where({
                                authorHexPubkey: user.hexpubkey(),
                                name: listName,
                                kind: event.kind
                            })
                            .first()
                            .then(async (dbEvent) => {
                                if (
                                    !dbEvent ||
                                    (dbEvent && listItem.createdAt > dbEvent.createdAt)
                                ) {
                                    db.lists.put(listItem);
                                    replaceableLists.push(listItem);
                                } else {
                                    // Do nothing because we already have the latest
                                }
                            });
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        });

        return liveQuery(() =>
            browser
                ? db.lists.where({ authorHexPubkey: user.hexpubkey() }).toArray() ||
                  replaceableLists
                : replaceableLists
        ) as Observable<App.List[]>;
    }
};

export default ReplaceableListInterface;
