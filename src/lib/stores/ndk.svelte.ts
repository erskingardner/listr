import type { NDKCacheAdapter } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { browser } from "$app/environment";

const cacheAdapter: NDKCacheAdapter | undefined = browser
    ? new NDKCacheAdapterDexie({ dbName: "listr-v2" })
    : undefined;

export const ndkStore = new NDK({
    explicitRelayUrls: [
        "wss://purplepag.es",
        "wss://relay.nostr.band",
        "wss://relay.snort.social",
        "wss://relay.damus.io",
        "wss://relay.primal.net",
    ],
    outboxRelayUrls: ["wss://purplepag.es", "wss://relay.primal.net"],
    autoConnectUserRelays: true,
    enableOutboxModel: true,
    cacheAdapter,
    clientName: "Listr",
});

ndkStore.connect().then(() => console.log("NDK Connected"));

// Create a singleton instance that is the default export
const ndk = $state(ndkStore);

export const bunkerNDKStore = new NDK({
    explicitRelayUrls: [
        "wss://relay.nsecbunker.com",
        "wss://relay.damus.io",
        "wss://relay.primal.net",
        "wss://relay.nostr.band",
    ],
    enableOutboxModel: false,
});

bunkerNDKStore.connect().then(() => console.log("Bunker NDK Connected"));
export const bunkerNdk = $state(bunkerNDKStore);
export default ndk;
