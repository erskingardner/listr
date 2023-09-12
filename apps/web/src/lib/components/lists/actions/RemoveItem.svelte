<script lang="ts">
    import { fly } from "svelte/transition";
    import { expoInOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";
    import { X } from "lucide-svelte";

    const dispatch = createEventDispatcher();

    export let editMode: boolean = false;
    export let type: string;
    export let id: string;
    export let privateItem: boolean;
    export let otherTagValues: string[] | undefined = undefined;
    export let unsaved: boolean;
    export let removal: boolean;
</script>

{#if editMode}
    <button
        transition:fly={{ x: -200, duration: 300, easing: expoInOut }}
        class="primaryActionButton"
        on:click={() =>
            dispatch("removeItem", {
                type,
                id,
                privateItem,
                otherTagValues,
                unsaved,
                removal,
            })}
    >
        <X strokeWidth="1.5" size="20" />
        Remove item
    </button>
{/if}
