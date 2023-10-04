<script lang="ts">
    import PersonItem from "./items/PersonItem.svelte";
    import EventItem from "./items/EventItem.svelte";
    import UrlItem from "./items/UrlItem.svelte";
    import EmojiItem from "./items/EmojiItem.svelte";
    import PreItem from "./items/PreItem.svelte";
    import type { NDKTag } from "@nostr-dev-kit/ndk";

    export let tag: NDKTag;
    export let id: string;
    export let kind: number | undefined = undefined;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean = false;
    export let editMode: boolean = false;

    const type: string = tag[0];
    const otherTagValues: string[] | undefined = tag.slice(2);
</script>

<div>
    {#if type === "p"}
        <PersonItem
            {type}
            pubkey={id}
            {privateItem}
            {unsaved}
            {removal}
            {editMode}
            on:removeItem
            on:removeUnsavedItem
        />
    {:else if type === "e"}
        <EventItem
            {type}
            {id}
            {privateItem}
            {unsaved}
            {removal}
            {editMode}
            on:removeItem
            on:removeUnsavedItem
        />
    {:else if type === "r"}
        <UrlItem
            {type}
            {id}
            {kind}
            {otherTagValues}
            {privateItem}
            {unsaved}
            {removal}
            {editMode}
            on:removeItem
            on:removeUnsavedItem
        />
    {:else if type === "a"}
        <PreItem
            {type}
            {id}
            {privateItem}
            {unsaved}
            {removal}
            {editMode}
            on:removeItem
            on:removeUnsavedItem
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
            on:removeItem
            on:removeUnsavedItem
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
