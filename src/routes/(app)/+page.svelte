<script lang="ts">
    import ListSummary from "$lib/components/lists/ListSummary.svelte";
    import listsStore from "$lib/stores/allLists";
    import { onDestroy } from "svelte";
    import { LIST_FILTER_REGEXP } from "$lib/utils";

    listsStore.ref();

    onDestroy(() => {
        listsStore.unref();
    });
</script>

<div class="flex flex-col gap-2">
    {#each $listsStore as list}
        {#if list.name && !list.name.match(LIST_FILTER_REGEXP)}
            <ListSummary
                name={list.name}
                kind={list.kind}
                date={list.created_at}
                authorPubkey={list.pubkey}
                listNip19={list.encode()}
            />
        {/if}
    {/each}
</div>
