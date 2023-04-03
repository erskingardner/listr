// import Dexie, { type Table } from 'dexie';

// export class Database extends Dexie {
//     users!: Table<App.List>;
//     lists!: Table<App.List>;

//     constructor() {
//         super('db');
//         this.version(1).stores({
//             users: '++id, name, displayName, image, banner, bio, nip05, lud16, about, zapService',
//             lists: '++id, content, kind, subject, created_at, pubkey, *tags'
//         });
//     }
// }

// export const db = new Database();
