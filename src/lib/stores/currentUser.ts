import { writable } from 'svelte/store';

export const currentUser = writable<App.User | undefined>(undefined);
