<script lang="ts">
import type { NDKList } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import { BoxSelect, Info, MenuSquare, UserSquare } from "lucide-svelte";
import { getListDisplayTitle } from "$lib/utils/lists";

let { list, npub }: { list: NDKList; npub: string } = $props();

const nip19 = $derived(list.encode());
const displayTitle = $derived(getListDisplayTitle(list));
const peopleItems = $derived(list.items.filter((item) => item[0] === "p"));
const eventItems = $derived(list.items.filter((item) => ["e", "a"].includes(item[0])));
const otherItems = $derived(list.items.filter((item) => !["p", "e", "a"].includes(item[0])));
</script>

<a
    href="/{npub}/{list.kind}/{nip19}"
    class="flex flex-col gap-1 border border-gray-300 rounded-md shadow-md bg-gray-50 dark:bg-gray-700 dark:border-gray-800 dark:text-gray-50 p-4 dark:hover:bg-gray-600"
>
    <div class="flex flex-row gap-2 items-center">
        <h3 class="text-lg font-bold truncate">{displayTitle}</h3>
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
