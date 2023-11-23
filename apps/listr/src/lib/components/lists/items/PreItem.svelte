<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import { NDKArticle } from "@nostr-dev-kit/ndk";
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import CommunityItem from "./CommunityItem.svelte";
    import Unstage from "../actions/Unstage.svelte";
    import RemoveItem from "../actions/RemoveItem.svelte";
    import { Smile } from "lucide-svelte";
    import { onMount } from "svelte";
    import { Name } from "@nostr-dev-kit/ndk-svelte-components";
    import { formattedDate } from "$lib/utils";

    export let type: string;
    export let id: string;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;
    export let editMode: boolean;

    const tagIdSplit = id.split(":");
    const kind: number = parseInt(tagIdSplit[0]);
    const creator: NDKUser = $ndk.getUser({ pubkey: tagIdSplit[1] });
    const name: string = tagIdSplit[2];

    let article: NDKArticle | undefined = undefined;

    onMount(async () => {
        if (kind === 30023) {
            const articleEvent = await $ndk.fetchEvent({
                kinds: [kind],
                authors: [creator.pubkey],
                "#d": [name],
            });
            if (articleEvent) {
                article = NDKArticle.from(articleEvent);
            }
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
                                >Published {formattedDate(article.published_at)}</span
                            >
                            <span class="italic">
                                by <a href="/{creator.npub}" class="hover:underline">
                                    <Name ndk={$ndk} user={creator} />
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
                    <Unstage {type} {id} {privateItem} {unsaved} {removal} on:removeUnsavedItem />
                {:else}
                    <RemoveItem
                        {type}
                        {id}
                        {privateItem}
                        {unsaved}
                        {removal}
                        {editMode}
                        on:removeItem
                    />
                    <ItemActions {type} {id} on:removeItem />
                {/if}
            </div>
        </div>
    </div>
{/key}
