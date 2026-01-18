import NDKCacheDexie from "@nostr-dev-kit/cache-dexie";
import { createNDK, type NDKSvelteWithSession } from "@nostr-dev-kit/svelte";
import { browser } from "$app/environment";

const cacheAdapter = browser ? new NDKCacheDexie({ dbName: "listr-v2" }) : undefined;

const ndk: NDKSvelteWithSession = createNDK({
    explicitRelayUrls: [
        "wss://purplepag.es",
        "wss://relay.snort.social",
        "wss://relay.damus.io",
        "wss://relay.primal.net",
        "wss://nos.lol",
        "wss://relay.ditto.pub",
    ],
    outboxRelayUrls: ["wss://purplepag.es", "wss://relay.primal.net"],
    enableOutboxModel: true,
    cacheAdapter,
    clientName: "Listr",
    session: true,
});

ndk.connect().then(() => console.log("NDK Connected"));

// Export the NDK instance both as default and named export for compatibility
export const ndkStore = ndk;
export default ndk;
