<script lang="ts">
import type { NDKList, NDKTag } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import { BoxSelect, Lock, MenuSquare, UserSquare } from "lucide-svelte";
import ndk from "$lib/stores/ndk.svelte";
import { getListDisplayTitle, hasEncryptedContent } from "$lib/utils/lists";

let { list, npub }: { list: NDKList; npub: string } = $props();

const currentUser = $derived(ndk.$currentUser);
const isOwnList = $derived(currentUser?.pubkey === list.pubkey);
const hasEncrypted = $derived(hasEncryptedContent(list));

// State for decrypted data
let decryptedTags: NDKTag[] = $state([]);
let decryptionAttempted = $state(false);

// Attempt to decrypt if it's the user's own list with encrypted content
$effect(() => {
    if (isOwnList && hasEncrypted && !decryptionAttempted) {
        decryptionAttempted = true;
        list.encryptedTags()
            .then((tags) => {
                decryptedTags = tags;
            })
            .catch(() => {
                // Decryption failed, leave decryptedTags empty
            });
    }
});

const nip19 = $derived(list.encode());
const displayTitle = $derived(
    getListDisplayTitle(list, decryptedTags.length > 0 ? decryptedTags : undefined)
);

// Combine public and decrypted private items for counts
// Safely convert list.items to array in case it's a reactive object
const publicItems: NDKTag[] = $derived(
    Array.isArray(list.items)
        ? list.items
        : list.items
          ? Array.from(list.items as Iterable<NDKTag>)
          : []
);
const allItems = $derived([...publicItems, ...decryptedTags]);
const peopleItems = $derived(allItems.filter((item) => item[0] === "p"));
const eventItems = $derived(allItems.filter((item) => ["e", "a"].includes(item[0])));
const otherItems = $derived(
    allItems.filter((item) => !["p", "e", "a", "title", "d", "description"].includes(item[0]))
);
</script>

<a
    href="/{npub}/{list.kind}/{nip19}"
    class="flex flex-col gap-1 border border-gray-300 rounded-md shadow-md bg-gray-50 dark:bg-gray-700 dark:border-gray-800 dark:text-gray-50 p-4 dark:hover:bg-gray-600"
>
    <div class="flex flex-row gap-2 items-center">
        <h3 class="text-lg font-bold truncate">{displayTitle}</h3>
        {#if hasEncrypted}
            <Lock strokeWidth="1.5" size="16" class="text-gray-500 dark:text-gray-400 shrink-0" />
            <Tooltip type="auto" class="dark:border-gray-800 dark:text-gray-50 shadow-md">
                This list has encrypted content
            </Tooltip>
        {/if}
    </div>
    {#if list.description}
        <p class="opacity-80 italic">{list.description}</p>
    {/if}
    <div class="text-sm flex flex-row gap-4 justify-between mt-auto pt-8 opacity-50 font-light">
        <p class="flex flex-row gap-1">
            <UserSquare strokeWidth="1" size="20" />{peopleItems.length}
            {peopleItems.length === 1 ? "person" : "people"}
        </p>
        <p class="flex flex-row gap-1">
            <MenuSquare strokeWidth="1" size="20" />{eventItems.length}
            {eventItems.length === 1 ? "event" : "events"}
        </p>
        <p class="flex flex-row gap-1">
            <BoxSelect strokeWidth="1" size="20" />{otherItems.length}
            {otherItems.length === 1 ? "other" : "others"}
        </p>
    </div>
</a>
