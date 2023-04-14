import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

declare global {
    namespace App {
        // interface Settings {}

        interface List {
            createdAt: number;
            kind: number;
            name: string;
            authorHexPubkey: string;
            publicItems: NDKTag[];
            // privateItems?: string[];
            lastFetched: number;
        }

        interface User extends NDKUserProfile {
            lastFetched?: number;
            npub?: string;
            hexpubkey?: string;
        }

        // interface Errors {}
        // interface Locals {}
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
