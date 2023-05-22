import { writable } from 'svelte/store';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

export const notes = writable<NDKEvent[]>([]);
