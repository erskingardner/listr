<script lang="ts">
    import ListSummary from "$lib/components/lists/ListSummary.svelte";
    import listsStore from "$lib/stores/lists";
    import { onDestroy } from "svelte";
    listsStore.ref();

    onDestroy(() => {
        listsStore.unref();
    });
</script>

{#each $listsStore as list}
    <ListSummary name={list.name} kind={list.kind} authorPubkey={list.pubkey} />
{/each}
