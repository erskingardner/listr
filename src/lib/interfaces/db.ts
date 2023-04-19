import Dexie, { type Table } from 'dexie';

export class Database extends Dexie {
    users!: Table<App.User>;
    lists!: Table<App.List>;

    constructor() {
        super('Listr');
        this.version(3).stores({
            users: '++id, name, displayName, image, banner, bio, nip05, lud16, about, zapService, lastFetched',
            lists: '++id, name, kind, createdAt, authorHexPubkey, publicItems*, privateItems*, npub, hexpubkey, lastFetched, [authorHexPubkey+name+kind]'
        });
    }
}

export const db = new Database();
