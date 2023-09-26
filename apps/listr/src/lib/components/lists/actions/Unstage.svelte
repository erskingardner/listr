<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { X } from "lucide-svelte";

    const dispatch = createEventDispatcher();

    export let type: string;
    export let id: string;
    export let privateItem: boolean;
    export let otherTagValues: string[] | undefined = undefined;
    export let unsaved: boolean;
    export let removal: boolean;
</script>

<button
    class="primaryActionButton dark:border-0 dark:bg-gray-600 dark:hover:bg-gray-500 !p-1.5 place-self-start lg:place-self-center"
    on:click={() =>
        dispatch("removeUnsavedItem", {
            type,
            id,
            privateItem,
            otherTagValues,
            unsaved,
            removal,
        })}
>
    <X strokeWidth="1.5" size="20" class="w-5 h-5" />
</button>
