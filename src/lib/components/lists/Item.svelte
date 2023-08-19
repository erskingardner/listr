<script lang="ts">
    import PersonItem from "./items/PersonItem.svelte";
    import ndk from "$lib/stores/ndk";
    import { EventCard } from "@nostr-dev-kit/ndk-svelte-components";

    export let type: string;
    export let id: string;
</script>

<div class="p-2 border-b border-b-gray-200">
    {#if type === "p"}
        <PersonItem pubkey={id} />
    {:else if type === "e"}
        {#key id}
            <EventCard ndk={$ndk} {id} />
        {/key}
    {:else}
        <pre>Unsupported item: <code>{JSON.stringify([type, id])}</code></pre>
    {/if}
</div>

<style lang="postcss">
    * > :global(.event-card) {
        border: 1px solid;
        @apply border border-gray-100 rounded-sm;
    }
</style>
