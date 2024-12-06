<script lang="ts">
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import PersonItem from "../lists/items/PersonItem.svelte";

let { event }: { event: NDKEvent } = $props();
</script>

<PersonItem
    type="p"
    pubkey={event.pubkey}
    unsaved={false}
    privateItem={false}
    removal={false}
    editMode={false}
/>
