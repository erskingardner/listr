import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';

declare global {
    namespace App {
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
