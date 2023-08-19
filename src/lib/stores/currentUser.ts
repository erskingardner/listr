import type { NDKUser } from "@nostr-dev-kit/ndk";
import { writable } from "svelte/store";

const currentUser = writable<NDKUser | undefined>(undefined);

export default currentUser;
