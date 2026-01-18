<script lang="ts">
import { NDKKind, NDKList, type NDKTag, type NDKUser } from "@nostr-dev-kit/ndk";
import { onMount } from "svelte";
import toast from "svelte-hot-french-toast";
import { invalidateAll } from "$app/navigation";
import ndk from "$lib/stores/ndk.svelte";
import {
    deduplicateItems,
    filterAndSortByTitle,
    filteredItemsForListKind,
    SUPPORTED_LIST_KINDS,
    unixTimeNowInSeconds,
} from "$lib/utils";

type ListOption = {
    id: string;
    title: string;
    kind: number;
    count: number;
};

let currentUser = $derived(ndk.$currentUser);

let lists: NDKList[] = $state([]);
let options: ListOption[] = $state([]);
let showKindMismatchWarning = $derived.by(() => {
    if (fromList && toList) {
        return fromList.kind !== toList.kind;
    }
    return false;
});

let deleteFromList = $state(false);
let mergeFromId: string | undefined = $state(undefined);
let mergeToId: string | undefined = $state(undefined);
let fromList: NDKList | undefined = $derived(
    mergeFromId ? lists?.find((list) => list.id === mergeFromId) : undefined
);
let toList: NDKList | undefined = $derived(
    mergeToId ? lists?.find((list) => list.id === mergeToId) : undefined
);

onMount(async () => {
    if (!currentUser) return;

    const userLists = await ndk.fetchEvents({
        kinds: SUPPORTED_LIST_KINDS,
        authors: [currentUser.pubkey],
    });

    const deletedEvents = await ndk.fetchEvents({
        kinds: [NDKKind.EventDeletion],
        authors: [currentUser.pubkey],
    });

    lists = filterAndSortByTitle(
        Array.from(userLists).map((event) => NDKList.from(event)),
        Array.from(deletedEvents)
    );

    options = await Promise.all(
        lists.map(async (list): Promise<ListOption> => {
            const option = await buildListOption(list);
            return option;
        })
    );
});

function resetTempStores() {
    mergeFromId = undefined;
    mergeToId = undefined;
    deleteFromList = false;
}

async function buildListOption(list: NDKList): Promise<ListOption> {
    let privateItems: NDKTag[] = [];
    // Decrypt private items if needed
    if (list.content.length > 0 && list.kind !== NDKKind.Contacts) {
        privateItems = await list.encryptedTags(true);
    }
    // Get public items
    const publicItems = list.items.filter((item) => !["L", "l"].includes(item[0]));
    const count = privateItems.length + publicItems.length;

    return {
        id: list.id,
        title: list.title as string,
        kind: list.kind as number,
        count,
    };
}

async function mergeLists(e: Event) {
    e.preventDefault();
    if (!fromList || !toList) {
        toast.error("Please select two lists to merge");
        return;
    }

    // Filter and deduplicate public items to merge
    const filteredFrom = fromList?.items.filter((item) => !["L", "l"].includes(item[0]));
    const filteredTo = toList?.items.filter((item) => !["L", "l"].includes(item[0]));
    const dedupedTags = deduplicateItems([...filteredFrom, ...filteredTo]);

    // Put the tags back in
    // Title and description handled below to make sure we adjust for deprecated "name"
    const toTagsToReplace = toList?.tags.filter((item) =>
        ["L", "l", "d", "image", "thumb", "summary", "alt", "expiration", "subject"].includes(
            item[0]
        )
    );

    // Filter items for compatability with list kind
    const filteredForListKind = filteredItemsForListKind(dedupedTags, toList?.kind as number);

    // Replace labels, d tags, etc.
    if (toTagsToReplace && toTagsToReplace.length > 0) {
        for (const tag of toTagsToReplace) {
            filteredForListKind.push(tag);
        }
    }

    // Deal with private items
    let privateTags: NDKTag[] = [];
    if (fromList.content || toList.content) {
        // Decrypt private items if needed
        const privateFromList = await fromList.encryptedTags();
        const privateToList = await toList.encryptedTags();
        privateTags = filteredItemsForListKind(
            deduplicateItems([...privateFromList, ...privateToList]),
            toList?.kind as number
        );
    }

    // Build new (merged) list
    const newList = new NDKList(ndk, {
        kind: toList?.kind as number,
        tags: filteredForListKind,
        content: privateTags.length > 0 ? JSON.stringify(privateTags) : "",
        created_at: unixTimeNowInSeconds(),
        pubkey: toList.pubkey,
    });

    // Add back title and description
    newList.title = toList.title;
    newList.description = toList.description;

    // Encrypt the new list if needed
    if (newList.content) {
        await newList.encrypt(currentUser as NDKUser, ndk.signer);
    }

    // Publish the new list
    newList
        .publish()
        .then(async () => {
            toast.success("Your lists were merged");
            invalidateAll();
            resetTempStores();
            if (deleteFromList) await createDeleteFromListEvent();
        })
        .catch((error) => {
            console.error(error);
            toast.error("Error merging lists");
        });
}

async function createDeleteFromListEvent() {
    if (!fromList) return;

    const deleteEvent = new NDKList(ndk, {
        kind: NDKKind.EventDeletion,
        content: "List deleted by owner",
        tags: fromList.referenceTags(),
        created_at: unixTimeNowInSeconds(),
        pubkey: fromList.pubkey,
    });

    deleteEvent
        .publish()
        .then(() => {
            toast.success(`"Merge from" list deleted`);
            invalidateAll();
        })
        .catch((error) => {
            console.error(error);
            toast.error(`Error deleting "Merge from" list`);
        });
}
</script>

<svelte:head>
    <title>Merge Lists - Listr</title>
    <meta
        name="description"
        content="Merge two lists on Listr, the best app for creating and managing your Nostr lists."
    />
</svelte:head>

<div
    class="flex flex-col gap-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-md p-4"
>
    <div class="text-lg font-bold">Merge lists</div>
    <span class="text-base font-normal">
        This will add all public & private items from the selected list to the target list
    </span>
    <hr class="dark:border-gray-700" />

    {#if options}
        <form
            class="grid items-center justify-start gap-x-6 gap-y-4 my-8"
            style="grid-template-columns: auto minmax(0, 1fr)"
        >
            <span class="shrink text-lg font-semibold flex flex-row gap-2 items-center">
                Merge from
            </span>
            <select id="mergeFrom" bind:value={mergeFromId} name="mergeFrom" class="bg-transparent">
                <option> Select a list</option>
                {#each options as list}
                    <option value={list.id}>
                        {list.title}: Kind {list.kind} list with {list.count} items
                    </option>
                {/each}
            </select>
            <span></span>
            <span class="text-3xl text-center">{"↓"}</span>
            <span class="text-lg font-semibold">Into</span>
            <select id="mergeTo" bind:value={mergeToId} name="mergeTo" class="bg-transparent">
                <option> Select a list</option>
                {#each options as list}
                    <option value={list.id}>
                        {list.title}: Kind {list.kind} list with {list.count} items
                    </option>
                {/each}
            </select>
            <span></span>
            <span class="flex gap-2 items-center pt-4">
                <input
                    type="checkbox"
                    bind:checked={deleteFromList}
                    id="deleteFromList"
                    name="deleteFromList"
                    class="bg-transparent p-2"
                />
                <label for="deleteFromList" class="ml-2 text-lg">
                    Delete "Merge from" list when done?
                </label></span
            >
            <span></span>
            <span>
                {#if showKindMismatchWarning}
                    <div class="kindMismatchWarning text-red-500 italic">
                        These lists are different kinds, we'll merge everything we can but
                        incompatible items will not be merged.
                    </div>
                {/if}
            </span>
            <span></span>
            <button
                onclick={mergeLists}
                type="submit"
                class="flex gap-x-3 rounded-md items-center p-2 text-center justify-center font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white"
            >
                Submit
            </button>
        </form>
    {/if}
</div>
