<script lang="ts">
    import PersonItem from "./items/PersonItem.svelte";
    import EventItem from "./items/EventItem.svelte";
    import UrlItem from "./items/UrlItem.svelte";
    import EmojiItem from "./items/EmojiItem.svelte";
    import PreItem from "./items/PreItem.svelte";
    import type { NDKTag } from "@nostr-dev-kit/ndk";

    export let tag: NDKTag;
    export let id: string;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean = false;
    export let editMode: boolean = false;

    const type: string = tag[0];
    const otherTagValues: string[] | undefined = tag.slice(2);
</script>

<!-- TODO: Need to filter out title, description, l, etc. tags -->
<!-- TODO: Support "client" tags (coracle) with icons -->
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
    {:else}
        <pre class="py-2">Unsupported item: <code>{JSON.stringify(tag)}</code></pre>
    {/if}
</div>
