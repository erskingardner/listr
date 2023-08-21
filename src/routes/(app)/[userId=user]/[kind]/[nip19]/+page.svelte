<script lang="ts">
    import Item from "$lib/components/lists/Item.svelte";
    import { Info } from "lucide-svelte";
    import ListActions from "$lib/components/lists/ListActions.svelte";
    import { Tooltip } from "flowbite-svelte";

    export let data;
</script>

<div class="flex flex-row items-center justify-between">
    <div class="text-lg font-bold flex flex-row items-center gap-2">
        {data.name}
        <Info strokeWidth="1.5" size="20" />
        <Tooltip type="light">Kind: {data.kind}</Tooltip>
    </div>
    <ListActions nip19={data.nip19} pubkey={data.pubkey} listId={data.listId} />
</div>
<hr />
<div class="flex flex-col">
    {#each data.privateItems || [] as item}
        <Item type={item[0]} id={item[1]} privateItem={true} />
    {/each}
    {#each data.items || [] as item}
        <Item type={item[0]} id={item[1]} privateItem={false} />
    {/each}
</div>
