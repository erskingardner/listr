import { writable } from "svelte/store";

// Store the user's current follower list as an array of hexpubkeys
const currentUserFollows = writable<string[]>([]);

export default currentUserFollows;
