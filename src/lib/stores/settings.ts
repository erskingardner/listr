import { writable } from 'svelte/store';

export const settings = writable<App.Settings>({
    theme: 'dark'
});
