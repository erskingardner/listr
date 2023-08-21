<script lang="ts">
    import PersonItem from "./items/PersonItem.svelte";
    import ndk from "$lib/stores/ndk";
    import { EventCard } from "@nostr-dev-kit/ndk-svelte-components";
    import EventItem from "./items/EventItem.svelte";

    export let type: string;
    export let id: string;
    export let privateItem: boolean;
</script>

{#key id}
    <div>
        {#if type === "p"}
            <PersonItem pubkey={id} {privateItem} />
        {:else if type === "e"}
            <EventItem {id} {privateItem} />
        {:else}
            <pre class="py-2">Unsupported item: <code>{JSON.stringify([type, id])}</code></pre>
        {/if}
    </div>
{/key}
