<script lang="ts">
import type { NDKTag } from "@nostr-dev-kit/ndk";
import type { ListItemParams } from "$lib/types";
import EmojiItem from "./items/EmojiItem.svelte";
import EventItem from "./items/EventItem.svelte";
import PersonItem from "./items/PersonItem.svelte";
import PreItem from "./items/PreItem.svelte";
import TagItem from "./items/TagItem.svelte";
import UrlItem from "./items/UrlItem.svelte";

let {
    tag,
    id,
    listKind,
    privateItem,
    unsaved,
    removal,
    editMode,
    removeItem,
    removeUnsavedItem,
}: {
    tag: NDKTag;
    id: string;
    listKind: number | undefined;
    privateItem: boolean;
    unsaved: boolean;
    removal: boolean;
    editMode: boolean;
    removeItem: (params: ListItemParams) => void;
    removeUnsavedItem: (params: ListItemParams) => void;
} = $props();

let type = $derived(tag[0]);
let otherTagValues = $derived(tag.slice(2));
</script>

<div>
    {#if type === "p"}
        <PersonItem
            {type}
            pubkey={id}
            {privateItem}
            {otherTagValues}
            {unsaved}
            {removal}
            {editMode}
            {removeItem}
            {removeUnsavedItem}
        />
    {:else if type === "e"}
        <EventItem
            {type}
            {id}
            {privateItem}
            {otherTagValues}
            {unsaved}
            {removal}
            {editMode}
            {removeItem}
            {removeUnsavedItem}
        />
    {:else if ["r", "relay"].includes(type)}
        <UrlItem
            {type}
            {id}
            {listKind}
            {otherTagValues}
            {privateItem}
            {unsaved}
            {removal}
            {editMode}
            {removeItem}
            {removeUnsavedItem}
        />
    {:else if type === "a"}
        <PreItem
            {type}
            {id}
            {privateItem}
            {otherTagValues}
            {unsaved}
            {removal}
            {editMode}
            {removeItem}
            {removeUnsavedItem}
        />
    {:else if type === "t"}
        <TagItem
            {type}
            {id}
            {privateItem}
            {otherTagValues}
            {unsaved}
            {removal}
            {editMode}
            {removeItem}
            {removeUnsavedItem}
        />
    {:else if type === "emoji"}
        <EmojiItem
            {type}
            {id}
            {otherTagValues}
            {privateItem}
            {unsaved}
            {removal}
            {editMode}
            {removeItem}
            {removeUnsavedItem}
        />
    {:else if ["L", "l", "name", "title", "description"].includes(type)}
        <!-- Don't do anything for now -->
    {:else if type === "client"}
        <!-- Refactor this to a component -->
        {#if id === "coracle"}
            <div
                class="flex flex-col w-full lg:w-auto lg:flex-row gap-4 lg:gap-2
        rounded-md p-2 my-2 lg:items-center border border-gray-200 dark:border-gray-700
        {unsaved ? 'border-gray-500/60 dark:border-gray-200/30 border-dashed' : ''}"
            >
                <img src="/images/coracle.webp" alt="Coracle" class="w-12 h-12 rounded-full" />
                Client: Coracle
            </div>
        {/if}
    {:else}
        <div>Unsupported item:</div>
        <pre class="py-2 whitespace-normal">
        <code>
            {JSON.stringify(tag)}
        </code>
    </pre>
    {/if}
</div>
