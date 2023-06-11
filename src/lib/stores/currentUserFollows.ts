import { writable } from 'svelte/store';

// Will be an array of npubs of the users that the current user follows
export const currentUserFollows = writable<string[] | undefined>(undefined);
