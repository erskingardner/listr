import { writable } from 'svelte/store';
import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';

export const currentUser = writable<NDKUser | undefined>(undefined);
export const currentUserProfile = writable<NDKUserProfile | undefined>(undefined);
