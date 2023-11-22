import { NDKKind, NDKList, NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
import { SUPPORTED_LIST_KINDS } from "$lib/utils";
import currentUser from "./currentUser";
import ndk from "./ndk";
import { get } from "svelte/store";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

let currentUserLists: NDKEventStore<ExtendedBaseType<NDKList>> | Writable<undefined>;
let deletedEvents: NDKEventStore<ExtendedBaseType<NDKEvent>> | Writable<undefined>;

const currentUserStore = get(currentUser);
const ndkStore = get(ndk);

console.log(ndkStore);

if (currentUserStore) {
    currentUserLists = ndkStore.storeSubscribe(
        {
            kinds: SUPPORTED_LIST_KINDS,
            authors: [currentUserStore.pubkey],
        },
        { closeOnEose: false },
        NDKList
    );

    deletedEvents = ndkStore.storeSubscribe({
        kinds: [NDKKind.EventDeletion],
        authors: [currentUserStore.pubkey],
    });
} else {
    currentUserLists = writable<undefined>(undefined);
    deletedEvents = writable<undefined>(undefined);
}

export { currentUserLists, deletedEvents };
