<script lang="ts">
import { X } from "lucide-svelte";
import type { ListItemParams } from "$lib/types";

let {
    type,
    id,
    privateItem,
    otherTagValues,
    unsaved,
    removal,
    removeUnsavedItem,
}: {
    type: string;
    id: string;
    privateItem: boolean;
    otherTagValues: string[] | undefined;
    unsaved: boolean;
    removal: boolean;
    removeUnsavedItem: (params: ListItemParams) => void;
} = $props();
</script>

<button
    class="primaryActionButton dark:border-0 dark:bg-gray-600 dark:hover:bg-gray-500 p-1.5! place-self-start lg:place-self-center"
    onclick={() =>
        removeUnsavedItem({
            type,
            id,
            privateItem,
            otherTagValues,
            unsaved,
            removal,
        })
    }
>
    <X strokeWidth="1.5" size="20" class="w-5 h-5" />
</button>
