import type { NDKFilter, GetUserParams, NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKTag } from '@nostr-dev-kit/ndk/lib/src/events';
import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import { liveQuery, type Observable, type PromiseExtended } from 'dexie';
import { browser } from '$app/environment';
import { db } from '$lib/interfaces/db';
import { unixTimeNow } from '$lib/utils/helpers';

export interface GetListOpts {
    listId?: string;
    name?: string;
    kind?: number;
    authorHexPubkey?: string;
}

export interface DeleteListOpts {
    listId?: string;
}

export interface CreateListOpts {
    event: NDKEvent;
}

function listNameForEvent(event: NDKEvent): string {
    let listName = '';
    if (event.kind === 10000) listName = 'mute';
    if (event.kind === 10001) listName = 'pin';
    if (event.kind === 30000 || event.kind === 30001) {
        listName = event.getMatchingTags('d')[0][1];
    }
    return listName;
}

function listValuesForEvent(event: NDKEvent): NDKTag[] {
    const listValues: NDKTag[] = [];
    event.tags.forEach(async (tag) => {
        if (!(tag[0] === 'd')) {
            listValues.push(tag);
        }
    });
    return listValues;
}

function buildListFromEvent(event: NDKEvent): App.List {
    const listName = listNameForEvent(event);
    const listValues = listValuesForEvent(event);
    const listItem: App.List = {
        listId: event.id,
        kind: event.kind as number,
        createdAt: event.created_at as number,
        name: listName,
        content: event.content,
        authorHexPubkey: event.pubkey,
        publicItems: listValues,
        lastFetched: unixTimeNow(),
        pointer: event.encode()
    };
    return listItem;
}

const ReplaceableListInterface = {
    getForUser: (opts: GetUserParams): Observable<App.List[]> => {
        const ndk = getStore(ndkStore);
        const user = ndk.getUser(opts);
        const hexPubkey = user.hexpubkey();
        const filter: NDKFilter = {
            kinds: [10000, 10001, 30000, 30001],
            authors: [hexPubkey]
        };
        const replaceableLists: App.List[] = [];

        ndk.fetchEvents(filter).then(async (eventSet) => {
            eventSet.forEach(async (event) => {
                const listName = listNameForEvent(event);
                if (listName.endsWith('/lastOpened')) return; // Skip to next if it's a client marker list
                const listItem: App.List = buildListFromEvent(event);
                const keysToDelete: string[] = [];
                const listCollection = db.lists.where({
                    authorHexPubkey: hexPubkey,
                    name: listName,
                    kind: event.kind
                });
                try {
                    if ((await listCollection.toArray()).length) {
                        listCollection.each(async (dbEvent, cursor) => {
                            if (listItem.createdAt > dbEvent.createdAt) {
                                keysToDelete.push(cursor.primaryKey);
                                db.lists.put(listItem);
                                replaceableLists.push(listItem);
                            } else {
                                // Do nothing because we already have the latest
                            }
                        });
                        db.lists.bulkDelete(keysToDelete);
                    } else {
                        db.lists.put(listItem);
                        replaceableLists.push(listItem);
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        });

        return liveQuery(() =>
            browser
                ? db.lists.where({ authorHexPubkey: hexPubkey }).toArray() || replaceableLists
                : replaceableLists
        ) as Observable<App.List[]>;
    },
    getCachedList: (opts: GetListOpts): Observable<App.List | undefined> => {
        return liveQuery(() => db.lists.where(opts).first());
    },
    get: (opts: GetListOpts): Observable<App.List> => {
        const ndk = getStore(ndkStore);
        let filter: NDKFilter;
        let event: NDKEvent | undefined = undefined;
        if (opts.listId) {
            filter = { ids: [opts.listId] };
        } else {
            filter = {
                kinds: [30000, 30001],
                authors: [opts.authorHexPubkey as string],
                '#d': [opts.name as string]
            };
        }
        let listItem: App.List | undefined = undefined;

        if (filter) {
            ndk.fetchEvent(filter).then((fetchedEvent) => {
                event = fetchedEvent;
                listItem = buildListFromEvent(event);
            });
        }

        return liveQuery(() =>
            browser ? db.lists.where(opts).first() || listItem : listItem
        ) as Observable<App.List>;
    },
    delete: (opts: DeleteListOpts): PromiseExtended<number | void> => {
        return db.lists
            .where(opts)
            .delete()
            .catch((e) => {
                console.error(e);
            });
    },
    create: (opts: CreateListOpts): PromiseExtended<string> => {
        const listItem: App.List = buildListFromEvent(opts.event);
        // Returned object is the PK of the new List
        return db.lists.put(listItem).catch((e) => {
            console.error(e);
        });
    }
};

export default ReplaceableListInterface;
