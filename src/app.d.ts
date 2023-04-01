// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Profile } from '$lib/types/Profile';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: Profile | null;
        }
        // interface PageData {}
        // interface Platform {}
    }
    interface Window {
        nostr: Nostr;
    }
}

export {};
