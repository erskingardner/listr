import { writable } from 'svelte/store';
import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

export const currentUserPubkey = writable('');
export const currentUserProfile = writable<NDKUserProfile | undefined>(undefined);
