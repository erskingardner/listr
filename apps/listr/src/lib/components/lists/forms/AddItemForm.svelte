<script lang="ts">
    import { Check } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    import { stringInputToTag, validateTagForListKind, placeholderForListKind } from "$lib/utils";
    import { browser } from "$app/environment";
    import type { NDKTag } from "@nostr-dev-kit/ndk";

    const dispatch = createEventDispatcher();

    export let kind: number;

    let listItem: string;
    let listItemType: string = "public";

    let addItemSubmitting: boolean = false;
    let addItemError: boolean = false;
    let addItemErrorMessage: string = "";

    function handleListAddition() {
        addItemSubmitting = true;
        addItemError = false;
        addItemErrorMessage = "";

        if (browser) {
            // Convert the string input to a NDKTag
            let tag: NDKTag | undefined;
            tag = stringInputToTag(listItem);

            if (!tag) {
                // Error if we can't parse the input to a tag
                addItemError = true;
                addItemErrorMessage = "Please enter a valid input.";
            } else if (tag && validateTagForListKind(tag, parseInt(kind.toString()))) {
                dispatch("addListItem", { tag: tag, type: listItemType });
            } else {
                // Error if the type of tag isn't valid for the kind of list
                addItemError = true;
                addItemErrorMessage = "This isn't a valid item for this kind of list.";
                listItem = "";
            }

            // Clean up the input
            listItem = "";
            listItemType = "public";
            addItemSubmitting = false;
        }
    }

    let placeholder: string = "";
    $: placeholder = placeholderForListKind(parseInt(kind.toString()));
</script>

<form class="mt-2 mb-6">
    <h3 class="font-medium">Add an item to this list</h3>
    <div class="flex flex-col lg:flex-row gap-2 items-center my-2">
        <input
            type="text"
            id="listItem"
            name="listItem"
            bind:value={listItem}
            tabindex="0"
            {placeholder}
            class="border-gray-400 w-full bg-transparent lg:w-auto rounded-md grow disabled:border-gray-200 disabled:bg-gray-100"
            required
        />
        <select
            id="listItemType"
            name="listItemType"
            bind:value={listItemType}
            tabindex="0"
            class="border-gray-400 rounded-md w-full lg:w-auto bg-transparent"
        >
            <option value="public">Public</option>
            <option value="private">Private</option>
        </select>
        <button
            on:click|preventDefault={handleListAddition}
            tabindex="0"
            class="w-full lg:w-auto justify-center lg:justify-start flex flex-row gap-1 items-center border border-indigo-600 bg-indigo-50 dark:bg-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500 rounded-md p-2 px-3"
            disabled={addItemSubmitting}
        >
            <Check strokeWidth="1.5" size="20" class="w-5 h-5" />
            <div>Add to list</div>
        </button>
    </div>
    {#if addItemError}
        <span class="text-sm text-red-600 italic">{addItemErrorMessage}</span>
    {/if}
</form>
