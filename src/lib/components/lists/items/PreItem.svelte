<script lang="ts">
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { NDKArticle } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { Smile } from "lucide-svelte";
import { User } from "$lib/ndk/ui/user";
import ndk from "$lib/stores/ndk.svelte";

// Cast ndk to NDKSvelte for component compatibility
const ndkSvelte = ndk as unknown as NDKSvelte;

import type { ListItemParams } from "$lib/types";
import { formattedDate } from "$lib/utils";
import RemoveItem from "../actions/RemoveItem.svelte";
import Unstage from "../actions/Unstage.svelte";
import CommunityItem from "./CommunityItem.svelte";
import ItemActions from "./ItemActions.svelte";
import PrivateItemPill from "./PrivateItemPill.svelte";
import RemovalItemPill from "./RemovalItemPill.svelte";

let {
    type,
    id,
    privateItem,
    otherTagValues,
    unsaved,
    removal,
    editMode,
    removeItem,
    removeUnsavedItem,
}: {
    type: string;
    id: string;
    privateItem: boolean;
    otherTagValues: string[] | undefined;
    unsaved: boolean;
    removal: boolean;
    editMode: boolean;
    removeItem: (params: ListItemParams) => void;
    removeUnsavedItem: (params: ListItemParams) => void;
} = $props();

const tagIdSplit = $derived(id.split(":"));
const kind: number = $derived(Number.parseInt(tagIdSplit[0], 10));
const creator: NDKUser = $derived(ndk.getUser({ pubkey: tagIdSplit[1] }));
const name: string = $derived(tagIdSplit[2]);

let article: NDKArticle | undefined = $state(undefined);

$effect(() => {
    if (kind === 30023) {
        ndk.fetchEvent({
            kinds: [kind],
            authors: [creator.pubkey],
            "#d": [name],
        })
            .then((articleEvent) => {
                if (articleEvent) {
                    article = NDKArticle.from(articleEvent);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
});
</script>

{#key id}
    <div
        class="flex flex-col w-full lg:w-auto lg:flex-row gap-4 lg:gap-2
        rounded-md p-2 my-2 lg:items-center border
        {unsaved
            ? 'border-gray-500/60 dark:border-gray-100/30 border-dashed'
            : 'border-gray-200 dark:border-gray-700'}"
    >
        <div class="flex flex-row gap-2 w-full items-center">
            {#if kind === 34550}
                <CommunityItem {name} {creator} />
            {:else if kind === 30030}
                <!-- TODO: add ability to see the emojis in the set -->
                <Smile strokeWidth="1.5" size="24" />
                Emoji Set: {name}
            {:else if kind === 30023}
                {#if article}
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-row gap-2 items-center">
                            <a href="nostr:{id}" class="font-semibold hover:underline text-lg"
                                >{article.title}</a
                            >
                        </div>
                        <div class="flex flex-row gap-2 items-center text-sm">
                            <span class="italic"
                                >Published {formattedDate(article.published_at as number)}</span
                            >
                            <span class="italic">
                                by <a href="/{creator.npub}" class="hover:underline">
                                    <User.Root ndk={ndkSvelte} user={creator}>
                                        <User.Name />
                                    </User.Root>
                                </a>
                            </span>
                        </div>
                        {article.summary}
                    </div>
                {/if}
            {:else}
                <pre class="py-2">Unsupported item: <code>{JSON.stringify([type, id])}</code></pre>
            {/if}
            {#if privateItem}
                <PrivateItemPill />
            {/if}
            <div class="flex flex-row gap-2 items-center ml-auto text-sm">
                {#if unsaved}
                    {#if removal}
                        <RemovalItemPill />
                    {/if}
                    <Unstage {type} {id} {privateItem} {otherTagValues} {unsaved} {removal} {removeUnsavedItem} />
                {:else}
                    <RemoveItem
                        {type}
                        {id}
                        {privateItem}
                        {otherTagValues}
                        {unsaved}
                        {removal}
                        {editMode}
                        {removeItem}
                    />
                    <ItemActions {type} {id} />
                {/if}
            </div>
        </div>
    </div>
{/key}
