import Dexie, { type Table } from 'dexie';
import type List from '$lib/classes/list';
import type User from '$lib/classes/user';
import type Note from '$lib/classes/note';

export class Database extends Dexie {
    users!: Table<User>;
    lists!: Table<List>;
    notes!: Table<Note>;

    constructor() {
        super('Listr2');
        this.version(1).stores({
            users: '&pubkey, npub, name, displayName, image, banner, bio, nip05, lud16, about, zapService, event, lastFetched',
            lists: '&id, nip19, authorPubkey, name, createdAt, kind, expanded, privateItems*, publicItems*, event, eventId, [kind+authorPubkey], [kind+authorPubkey+name]',
            notes: '&id, nip19, authorPubkey, createdAt, kind, event, content, [kind+authorPubkey]'
        });
    }
}

export const db = new Database();
