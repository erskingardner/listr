import { writable } from 'svelte/store';

export const authedPubkey = writable('');
export const authedProfileMetadata = writable('');
export const theme = writable('dark');
