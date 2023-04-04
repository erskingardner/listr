import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
import Dexie, { type Table } from 'dexie';

export class Database extends Dexie {
    users!: Table<NDKUserProfile>;
    lists!: Table<NDKEvent>;

    constructor() {
        super('Listr');
        this.version(7).stores({
            users: '++id, name, displayName, image, banner, bio, nip05, lud16, about, zapService',
            lists: '++id, content, kind, subject, created_at, pubkey, *tags'
        });
    }
}

export const db = new Database();
