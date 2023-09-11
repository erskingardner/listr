<script lang="ts">
    import { FilePlus } from "lucide-svelte";
    import currentUser from "$lib/stores/currentUser";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let pubkey: string;
</script>

{#if $currentUser?.hexpubkey === pubkey}
    <button on:click={() => dispatch("toggleEditForm")} class="primaryActionButton">
        <FilePlus strokeWidth="1.5" size="20" />
        Add items
    </button>
{/if}
