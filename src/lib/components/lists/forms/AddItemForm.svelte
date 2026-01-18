<script lang="ts">
import type { NDKTag } from "@nostr-dev-kit/ndk";
import { Check } from "lucide-svelte";
import { browser } from "$app/environment";
import {
    kindIsRelayList,
    placeholderForListKind,
    stringInputToTag,
    validateTagForListKind,
} from "$lib/utils";

let {
    kind,
    addListItem,
}: {
    kind: number;
    addListItem: (tag: NDKTag, type: string) => void;
} = $props();

let listItem = $state("");
let listItemType = $state("public");
let relayReadWrite = $state<string | undefined>(undefined);

let addItemSubmitting = $state(false);
let addItemError = $state(false);
let addItemErrorMessage = $state("");
let placeholder = $derived(placeholderForListKind(Number.parseInt(kind.toString(), 10)));

async function handleListAddition(e: MouseEvent) {
    e.preventDefault();
    addItemSubmitting = true;
    addItemError = false;
    addItemErrorMessage = "";

    if (browser) {
        // Convert the string input to a NDKTag
        let tag: NDKTag | undefined;
        if (relayReadWrite === "read" || relayReadWrite === "write") {
            tag = await stringInputToTag(listItem, kind, [relayReadWrite]);
        } else {
            tag = await stringInputToTag(listItem, kind);
        }

        if (!tag) {
            // Error if we can't parse the input to a tag
            addItemError = true;
            addItemErrorMessage = "Please enter a valid input.";
        } else if (tag && validateTagForListKind(tag, Number.parseInt(kind.toString(), 10))) {
            addListItem(tag, listItemType);
        } else {
            // Error if the type of tag isn't valid for the kind of list
            addItemError = true;
            addItemErrorMessage = "This isn't a valid item for this kind of list.";
            listItem = "";
        }

        // Clean up the input
        listItem = "";
        relayReadWrite = undefined;
        listItemType = "public";
        addItemSubmitting = false;
    }
}
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
        {#if kindIsRelayList(kind) || (listItem && (listItem.startsWith("wss://") || listItem.startsWith("ws://")))}
            <select
                id="relayReadWrite"
                name="relayReadWrite"
                bind:value={relayReadWrite}
                tabindex="0"
                class="border-gray-400 rounded-md w-full lg:w-auto bg-transparent"
            >
                <option value="">Read & Write</option>
                <option value="read">Read</option>
                <option value="write">Write</option>
            </select>
        {/if}
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
            onclick={handleListAddition}
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
