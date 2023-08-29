<script lang="ts">
    import { FileEdit } from "lucide-svelte";
    import { Tooltip } from "flowbite-svelte";
    import currentUser from "$lib/stores/currentUser";

    export let listId: string;
    export let pubkey: string;
</script>

{#if $currentUser?.hexpubkey() === pubkey}
    <button on:click={() => console.log("Implement edit")}>
        <FileEdit strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
    </button>
    <Tooltip type="light">Edit this list</Tooltip>
{/if}
