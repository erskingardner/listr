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

<div class="flex flex-col lg:flex-row gap-1 items-center lg:w-2/3 my-2">
    <input
        type="text"
        id="listItem"
        name="listItem"
        bind:value={listItem}
        tabindex="0"
        placeholder="NIP-19 identifier (npub, nprofile, note, nevent, or naddr)"
        class="border-gray-400 rounded-md grow w-full disabled:border-gray-200 disabled:bg-gray-100"
        required
    />
    <select
        id="listItemType"
        name="listItemType"
        bind:value={listItemType}
        tabindex="0"
        class="border-gray-400 rounded-md w-full lg:w-auto"
    >
        <option value="public">Public</option>
        <option value="private">Private</option>
    </select>
    <button
        on:click|preventDefault={handleListAddition}
        tabindex="0"
        class="w-full lg:w-auto flex justify-center border border-gray-400 bg-green-50 hover:bg-green-200 rounded-md p-2 disabled:border-gray-200 disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500"
        disabled={addItemSubmitting}
    >
        <Check strokeWidth="1.5" />
    </button>
</div>
{#if addItemError}
    <span class="text-sm text-red-600 italic">{addItemErrorMessage}</span>
{/if}
