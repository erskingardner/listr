<script lang="ts">
import { X } from "lucide-svelte";
import { expoInOut } from "svelte/easing";
import { fly } from "svelte/transition";
import type { ListItemParams } from "$lib/types";

let {
    editMode,
    type,
    id,
    privateItem,
    otherTagValues,
    unsaved,
    removal,
    removeItem,
}: {
    editMode: boolean;
    type: string;
    id: string;
    privateItem: boolean;
    otherTagValues?: string[];
    unsaved: boolean;
    removal: boolean;
    removeItem: (params: ListItemParams) => void;
} = $props();
</script>

{#if editMode}
    <button
        transition:fly={{ x: -200, duration: 300, easing: expoInOut }}
        class="primaryActionButton"
        onclick={() => removeItem({ type, id, privateItem, otherTagValues, unsaved, removal })}
    >
        <X strokeWidth="1.5" size="20" class="w-5 h-5" />
        Remove item
    </button>
{/if}
