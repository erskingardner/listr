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
    class="primaryActionButton !bg-orange-50 !border-orange-300 hover:!bg-orange-100 place-self-start"
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
    Unstage
</button>
