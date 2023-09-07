<script lang="ts">
    import { FilePlus } from "lucide-svelte";
    import { Tooltip } from "flowbite-svelte";
    import currentUser from "$lib/stores/currentUser";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let pubkey: string;
</script>

{#if $currentUser?.hexpubkey === pubkey}
    <button on:click={() => dispatch("toggleEditForm")}>
        <FilePlus strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
    </button>
    <Tooltip type="light">Add items to this list</Tooltip>
{/if}
