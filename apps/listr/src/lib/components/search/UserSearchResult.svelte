<script lang="ts">
    import type { NDKEvent } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import PersonItem from "../lists/items/PersonItem.svelte";

    export let event: NDKEvent;

    const user = $ndk.getUser({ hexpubkey: event.pubkey });
</script>

<PersonItem
    type="p"
    pubkey={event.pubkey}
    unsaved={false}
    privateItem={false}
    removal={false}
    editMode={false}
/>
