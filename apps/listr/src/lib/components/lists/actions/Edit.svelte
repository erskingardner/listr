<script lang="ts">
    import { FileEdit, FileX } from "lucide-svelte";
    import currentUser from "$lib/stores/currentUser";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let pubkey: string;
    export let editMode: boolean;
</script>

{#if $currentUser?.hexpubkey === pubkey}
    {#if editMode}
        <button on:click={() => dispatch("toggleEditMode")} class="primaryActionButton">
            <FileX strokeWidth="1.5" size="20" class="w-5 h-5" />
            Stop editing
        </button>
    {:else}
        <button on:click={() => dispatch("toggleEditMode")} class="primaryActionButton">
            <FileEdit strokeWidth="1.5" size="20" class="w-5 h-5" />
            Edit
        </button>
    {/if}
{/if}
