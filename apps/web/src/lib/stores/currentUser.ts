import type { NDKUser } from "@nostr-dev-kit/ndk";
import { writable } from "svelte/store";

const currentUser = writable<NDKUser | null>(null);

export default currentUser;
