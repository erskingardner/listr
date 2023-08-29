import { browser } from "$app/environment";
import type { NDKCacheAdapter } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import { writable } from "svelte/store";

let cacheAdapter: NDKCacheAdapter | undefined;

if (browser) {
    cacheAdapter = new NDKCacheAdapterDexie({ dbName: "listr-v2" });
}

export const ndkStore = new NDKSvelte({
    explicitRelayUrls: [
        "ws://localhost:8080",
        "wss://purplepag.es",
        // "wss://relay.nostr.band",
        // "wss://nos.lol",
        // "wss://relay.snort.social",
        // "wss://relay.damus.io",
    ],
    cacheAdapter: cacheAdapter,
});

ndkStore.connect().then(() => console.log("NDK Connected"));

// Create a singleton instance that is the default export
const ndk = writable(ndkStore);

export default ndk;
