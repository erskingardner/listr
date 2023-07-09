import { NDKNip07Signer, type NDKEvent, type NDKFilter, type NDKTag } from '@nostr-dev-kit/ndk';
import { db } from '$lib/interfaces/db';
import { browser } from '$app/environment';
import type { Observable, PromiseExtended } from 'dexie';
import ndkStore from '$lib/stores/ndk';
import { get } from 'svelte/store';
import { liveQuery } from 'dexie';
import { nip19 } from 'nostr-tools';
import type { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';

interface ListParams {
    event?: string; // The parsed event as NDKEvent
    eventId?: string; // The raw nostr event ID
    id?: string; // either kind:author tuple for replaceable or NIP-33 kind:author:d-tag for PRE
    nip19?: string; // NIP-19 nevent or naddr encoded id
    authorPubkey: string; // Hex pubkey of the author
    name: string; // The d-tag name, if exists
    content: string;
    createdAt?: number;
    kind: number;
    expanded: boolean; // Expanded or collapsed for display
    publicItems: NDKTag[]; // The public items in the list, in tag format
    privateItems: NDKTag[]; // The private items in the list, in tag format
}

export interface DeleteListParams {
    listId?: string;
}

export interface CreateListParams {
    event: NDKEvent;
}

/**
 * List is a formatted and extended version of an NDKEvent for
 * known kinds of lists. You can see the list of supported events in the
 * isKnownListKind method below.
 */

export default class List {
    static supportedKinds = [
        3, // contacts
        10000, // mute
        10001, // pin
        30000, // categorized people
        30001 // categorized bookmarks
    ];

    event?: string; // The parsed event as NDKEvent
    eventId?: string; // The raw nostr event ID
    id?: string; // either kind:author tuple for replaceable or NIP-33 kind:author:d-tag for PRE
    nip19?: string; // NIP-19 nevent or naddr encoded id
    authorPubkey: string; // Hex pubkey of the author
    name: string; // The d-tag name, if exists
    content: string;
    createdAt?: number;
    kind: number;
    expanded: boolean; // Expanded or collapsed for display
    publicItems: NDKTag[]; // The public items in the list, in tag format
    privateItems: NDKTag[]; // The private items in the list, in tag format

    constructor(listParams: ListParams) {
        this.event = listParams.event;
        this.eventId = listParams.eventId;
        this.id = listParams.id;
        this.nip19 = listParams.nip19;
        this.authorPubkey = listParams.authorPubkey;
        this.name = listParams.name;
        this.content = listParams.content;
        this.createdAt = listParams.createdAt;
        this.kind = listParams.kind;
        this.expanded = listParams.expanded;
        this.privateItems = listParams.privateItems;
        this.publicItems = listParams.publicItems;
    }

    static fromNdkEvent(event: NDKEvent): List {
        // Throw an error if it's not a known kind of list
        if (!this.isKnownListKind(event))
            throw new Error(`Unknown list kind: event kind ${event.kind}`);

        const list = new List({
            event: JSON.stringify(event.rawEvent()),
            eventId: event.id,
            id: this.listIdForListEvent(event),
            nip19: event.encode(),
            authorPubkey: event.pubkey,
            name: this.listNameForListEvent(event),
            content: event.content,
            createdAt: event.created_at as number,
            kind: event.kind as number,
            expanded: true,
            privateItems: [],
            publicItems: this.publicItemsForListEvent(event)
        });

        return list;
    }

    /**
     * Returns all the lists for the user, fetching them from relays as needed.
     * @param pubkey The hexpubkey of the user you want to fetch lists for
     * @returns Observable<List[]>
     */
    static forUser(pubkey: string): Observable<List[]> {
        const ndk = get(ndkStore);

        const listsForUser: List[] = [];
        const deleteRequestEventIds: string[] = [];

        const deleteFilter: NDKFilter = {
            kinds: [5],
            authors: [pubkey]
        };

        const listsFilter: NDKFilter = {
            kinds: List.supportedKinds,
            authors: [pubkey]
        };

        ndk.fetchEvents(deleteFilter)
            .then((eventSet) => {
                eventSet.forEach((event: NDKEvent) => {
                    const tag = event.getMatchingTags('a')[0];
                    if (tag) deleteRequestEventIds.push(tag[1]);
                });
            })
            .then(() => {
                ndk.fetchEvents(listsFilter)
                    .then((eventSet) => {
                        eventSet.forEach((event: NDKEvent) => {
                            const list = List.fromNdkEvent(event);
                            if (list.name?.endsWith('/lastOpened')) return; // Skip to next if it's a client marker list
                            if (list.name.length === 0) return; // Skip to the next if it's a list without a name
                            if (deleteRequestEventIds.includes(list.id as string)) return; // Skip if we have a delete request for a given list event
                            listsForUser.push(list);
                            list.save();
                        });
                    })
                    .catch((e) => {
                        console.error(e);
                    });
            })
            .catch((e) => {
                console.error(e);
            });

        return liveQuery(() =>
            browser ? db.lists.where('authorPubkey').equals(pubkey).toArray() : listsForUser
        ) as Observable<List[]>;
    }

    /**
     * Returns a single list based on a filter, fetching from relays as needed.
     * @param filter And NDKFilter for the list you'd like to fetch.
     * @returns Observable<List>
     */
    static get(filter: NDKFilter): Observable<List> {
        const ndk = get(ndkStore);
        let fetchedList: List;
        ndk.fetchEvent(filter).then((event) => {
            fetchedList = List.fromNdkEvent(event as NDKEvent);
            fetchedList.save();
        });

        let dbQueryFilter: {
            kind?: number;
            authorPubkey?: string;
            name?: string;
            eventId?: string;
        };
        if (filter.ids) {
            dbQueryFilter = {
                eventId: filter.ids?.find(() => true)
            };
        } else {
            dbQueryFilter = {
                kind: filter.kinds?.find(() => true),
                authorPubkey: filter.authors?.find(() => true), // Will give first element
                name: filter['#d'].find(() => true)
            };
        }

        return liveQuery(() =>
            browser ? db.lists.get(dbQueryFilter) : fetchedList
        ) as Observable<List>;
    }

    /**
     * Checks if the event passed is a known kind of list
     * @param event an NDKEvent
     * @returns boolean
     */
    static isKnownListKind(event: NDKEvent): boolean {
        if (!event || !event.kind) return false;
        return List.supportedKinds.includes(event.kind as number);
    }

    /** Creates a new list in the local database. */
    static create(opts: CreateListParams): PromiseExtended<string> {
        const listItem: List = List.fromNdkEvent(opts.event);
        // Returned object is the PK of the new List
        return db.lists.put(listItem).catch((e: any) => {
            console.error(e);
        });
    }

    /**
     * Generates an NDKTag from a NIP-19 identifier string
     * @param nip19 NIP-19 identifier
     * @returns NDKTag
     */
    static tagFromNip19String(nip19Id: string): NDKTag {
        const decodedEvent = nip19.decode(nip19Id);
        let tag: NDKTag = [];
        switch (decodedEvent.type) {
            case 'npub':
                tag = ['p', decodedEvent.data as string];
                break;
            case 'nprofile':
                tag = ['p', (decodedEvent.data as ProfilePointer).pubkey as string];
                break;
            case 'nevent':
                tag = ['e', (decodedEvent.data as EventPointer).id as string];
                break;
            case 'note':
                tag = ['e', decodedEvent.data as string];
                break;
            case 'naddr':
                tag = [
                    'a',
                    `${decodedEvent.data.kind}:${decodedEvent.data.pubkey}:${decodedEvent.data.identifier}`
                ];
                break;
            default:
                throw new Error('Unsupported NIP-19 Identifier');
        }
        return tag;
    }

    /**
     * Toggles the visibility of a list
     */
    public async toggleExpanded() {
        if (browser) {
            await db.lists
                .where('id')
                .equals(this.id as string)
                .modify((list: List) => {
                    list.expanded = !this.expanded;
                });
        }
    }

    /**
     * This performs an upsert on a list in the browser IndexedDB cache. We first check
     * for an existing list of the same ID and only update if the current version of the list
     * is newer.
     */
    public async save(): Promise<List | false> {
        if (browser) {
            try {
                const storedList = await db.lists.get(this.id);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (!storedList || this.createdAt! >= storedList!.createdAt!) {
                    if (storedList) this.expanded = storedList.expanded; // Don't overwrite if it's there already
                    await db.lists.put(this);
                    return this;
                } else {
                    return false;
                }
            } catch (e) {
                console.log(e);
                return false;
            }
        } else {
            return false;
        }
    }

    /** Deletes a list item from the local database. Doesn't send a delete request to relays
     */
    public delete(): PromiseExtended<number | void> {
        return db.lists
            .where({ id: this.id })
            .delete()
            .catch((e: any) => {
                console.error(e);
            });
    }

    /**
     * Whether the list contains any people tags
     * @param includePrivate Should we include private list items or only public list items
     * @returns boolean
     */
    public hasPeople(includePrivate: boolean): boolean {
        const hasPublicPTags =
            this.publicItems && this.publicItems.filter((item) => item[0] === 'p').length > 0;
        const hasPrivatePTags =
            this.privateItems && this.privateItems.filter((item) => item[0] === 'p').length > 0;

        // Do we want to inlcude private items?
        return (includePrivate ? hasPublicPTags || hasPrivatePTags : hasPublicPTags) as boolean;
    }

    /**
     * Returns an array of userIds of all public people tags in a given list
     * @returns string[]
     */
    public publicUserIdsForList(): string[] {
        return this.publicItems?.filter((item) => item[0] === 'p').map((item) => item[1]);
    }

    /**
     * Returns a list of NDKTags for the public items in a list.
     * @returns an array of NDKTag objects or undefined if there are no items
     */
    private static publicItemsForListEvent(event: NDKEvent): NDKTag[] {
        return event.tags.filter((tag) => tag[0] !== 'd');
    }

    /**
     * Decrypt and format the list of private items in a list.
     * NOT IMPLEMENTED
     * @returns an array of NDKTag objects or undefined if there are no private items
     */
    private static async privateItemsForListEvent(event: NDKEvent): Promise<NDKTag[] | undefined> {
        // If there is no content, there are no private items
        if (!event.content) return;
        try {
            const ndk = get(ndkStore);
            const signer = new NDKNip07Signer();
            ndk.signer = signer;
            await event.decrypt(event.author);
            const decryptedContent = JSON.parse(event.content);
            console.log('PRIVATE ITEMS', decryptedContent);
            // return decryptedContent as NDKTag[];
            return [];
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    /**
     * Return the name of the list based on kind and d-tag
     * @returns string
     */
    private static listNameForListEvent(event: NDKEvent): string {
        let listName = '';
        if (event.kind === 3) listName = 'following';
        if (event.kind === 10000) listName = 'mute';
        if (event.kind === 10001) listName = 'pin';
        if (event.kind === 30000 || event.kind === 30001) {
            listName = event.replaceableDTag();
        }
        return listName;
    }

    /**
     * Returns the listId for a list based on kind, author, and d-tag
     * @returns string
     */
    private static listIdForListEvent(event: NDKEvent): string {
        let id = '';
        if (event.kind === 3 || event.kind === 10000 || event.kind === 10001)
            id = `${event.kind as number}:${event.pubkey}`;
        if (event.kind === 30000 || event.kind === 30001) id = event.tagId();
        return id;
    }
}
