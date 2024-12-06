<script lang="ts">
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import { FileEdit, FileX } from "lucide-svelte";

let {
    pubkey,
    editMode,
    toggleEditMode,
}: {
    pubkey: string;
    editMode: boolean;
    toggleEditMode: () => void;
} = $props();

let currentUser = $derived(getCurrentUser());
</script>

{#if currentUser.user?.pubkey === pubkey}
    {#if editMode}
        <button onclick={toggleEditMode} class="primaryActionButton">
            <FileX strokeWidth="1.5" size="20" class="w-5 h-5" />
            Stop editing
        </button>
    {:else}
        <button onclick={toggleEditMode} class="primaryActionButton">
            <FileEdit strokeWidth="1.5" size="20" class="w-5 h-5" />
            Edit
        </button>
    {/if}
{/if}
