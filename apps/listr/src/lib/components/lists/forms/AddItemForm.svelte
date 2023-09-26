<script lang="ts">
    import { Check } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    import { NOSTR_BECH32_REGEXP, nip19ToTag } from "$lib/utils";

    const dispatch = createEventDispatcher();

    let listItem: string;
    let listItemType: string = "public";

    let addItemSubmitting: boolean = false;
    let addItemError: boolean = false;
    let addItemErrorMessage: string = "";

    function handleListAddition() {
        addItemSubmitting = true;
        addItemError = false;
        addItemErrorMessage = "";

        if (listItem.match(NOSTR_BECH32_REGEXP)) {
            const tag = nip19ToTag(listItem);
            dispatch("addListItem", { tag: tag, type: listItemType });
        } else {
            addItemError = true;
            addItemErrorMessage = "Please enter a valid NIP-19 identifier";
        }
        listItem = "";
        listItemType = "public";
        addItemSubmitting = false;
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
            placeholder="Identifier (npub..., nprofile..., note..., nevent..., or naddr...)"
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
