<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    import Zap from "./Zap.svelte";
    import Like from "./Like.svelte";
    import CopyId from "./CopyId.svelte";
    import Fork from "./Fork.svelte";
    import Delete from "./Delete.svelte";
    import Edit from "./Edit.svelte";
    import type { NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
    import { FORKABLE_LIST_KINDS } from "$lib/utils";

    export let nip19: string;
    export let listId: string;
    export let pubkey: string;
    export let rawList: NostrEvent;

    const listKind: NDKKind = rawList.kind as NDKKind;
</script>

{#if $currentUser}
    <div class="flex flex-row gap-4 items-center">
        <Zap {nip19} {listId} />
        <Like {listId} />
        <CopyId {nip19} />
        {#if $currentUser && pubkey !== $currentUser.hexpubkey() && FORKABLE_LIST_KINDS.includes(listKind)}
            <Fork {rawList} />
        {/if}
        <Edit {listId} {pubkey} on:toggleEditForm />
        <Delete {listId} {pubkey} />
    </div>
{/if}
