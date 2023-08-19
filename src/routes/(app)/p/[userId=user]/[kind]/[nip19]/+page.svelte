<script lang="ts">
    import type { PageServerData } from "./$types";
    import Item from "$lib/components/lists/Item.svelte";

    export let data: PageServerData;
</script>

<div class="text-lg font-bold">
    {data.name}
</div>
<hr />
<div class="flex flex-col gap-2">
    {#each data.items || [] as item}
        <Item type={item[0]} id={item[1]} />
    {/each}
</div>
