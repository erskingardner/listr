<script lang="ts">
    import type { NDKList } from "@nostr-dev-kit/ndk";
    import { BoxSelect, MenuSquare, UserSquare } from "lucide-svelte";

    export let list: NDKList;
    export let npub: string;

    const nip19 = list.encode();

    const peopleItems = list.items.filter((item) => item[0] === "p");
    const eventItems = list.items.filter((item) => ["e", "a"].includes(item[0]));
    const otherItems = list.items.filter((item) => !["p", "e", "a"].includes(item[0]));
</script>

<a
    href="/{npub}/{list.kind}/{nip19}"
    class="flex flex-col gap-1 border border-gray-300 rounded-md shadow-md bg-gray-50 dark:bg-gray-700 dark:border-gray-800 dark:text-gray-50 p-4 hover:dark:bg-gray-600"
>
    <h3 class="text-lg font-bold">{list.name}</h3>
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
