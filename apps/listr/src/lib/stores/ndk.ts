import { browser } from "$app/environment";
import type { NDKCacheAdapter } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import NDK from "@nostr-dev-kit/ndk";
import { writable } from "svelte/store";

let cacheAdapter: NDKCacheAdapter | undefined;

if (browser) {
    cacheAdapter = new NDKCacheAdapterDexie({ dbName: "listr-v2" });
}

export const ndkStore = new NDKSvelte({
    explicitRelayUrls: [
        "wss://purplepag.es",
        "wss://relay.nostr.band",
        "wss://nos.lol",
        "wss://relay.snort.social",
        "wss://relay.damus.io",
    ],
    outboxRelayUrls: ["wss://purplepag.es"],
    enableOutboxModel: false,
    cacheAdapter: cacheAdapter,
});

ndkStore.connect().then(() => console.log("NDK Connected"));

// Create a singleton instance that is the default export
const ndk = writable(ndkStore);

export const bunkerNDKStore = new NDK({
    explicitRelayUrls: [
        "wss://relay.nsecbunker.com",
        "wss://nos.lol",
        "wss://relay.damus.io",
        "wss://relay.nostr.band",
    ],
    enableOutboxModel: false,
});

bunkerNDKStore.connect().then(() => console.log("Bunker NDK Connected"));
export const bunkerNdk = writable(bunkerNDKStore);

export default ndk;
