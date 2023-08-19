import { writable } from 'svelte/store';
import type User from '$lib/classes/user';

export const currentUser = writable<User | undefined>(undefined);
