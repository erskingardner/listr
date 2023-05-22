import Dexie, { type Table } from 'dexie';

export class Database extends Dexie {
    users!: Table<App.User>;
    lists!: Table<App.List>;
    // notes!: Table<App.Note>;

    constructor() {
        super('Listr');
        this.version(8).stores({
            users: '++id, name, displayName, image, banner, bio, nip05, lud16, about, zapService, lastFetched',
            lists: '++id, listId, pointer, name, kind, content, createdAt, authorHexPubkey, publicItems*, privateItems*, npub, hexpubkey, lastFetched, expanded, [authorHexPubkey+name+kind], [authorHexPubkey+name+kind+listId]'
            // notes: '++id, content, subject, kind, authorHexPubkey, sig, createdAt, noteId, tags '
        });
    }
}

export const db = new Database();
