import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';

declare global {
    namespace App {
        interface List {
            createdAt?: number;
            listId?: string;
            pointer?: string;
            kind: number;
            name: string;
            content: string;
            authorHexPubkey: string;
            publicItems: NDKTag[];
            // privateItems?: string[];
            lastFetched?: number;
            expanded: boolean;
        }

        interface User extends NDKUserProfile {
            lastFetched?: number;
            npub?: string;
            hexpubkey?: string;
        }

        interface Note {
            createdAt?: number;
            noteId: string;
            kind: number;
            content: string;
            subject: string;
            authorHexPubkey: string;
            tags: NDKTags[];
            sig: string;
        }

        interface PageData {
            flash?: { type: 'success' | 'error'; message: string };
        }
        // interface Locals {}
        // interface Settings {}
        // interface Errors {}
        // interface Platform {}
    }
}

export {};
