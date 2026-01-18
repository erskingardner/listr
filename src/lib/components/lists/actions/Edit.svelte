<script lang="ts">
import { FileEdit, FileX } from "lucide-svelte";
import ndk from "$lib/stores/ndk.svelte";

let {
    pubkey,
    editMode,
    toggleEditMode,
}: {
    pubkey: string;
    editMode: boolean;
    toggleEditMode: () => void;
} = $props();

let currentUser = $derived(ndk.$currentUser);
</script>

{#if currentUser?.pubkey === pubkey}
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
