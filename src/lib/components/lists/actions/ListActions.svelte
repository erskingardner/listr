<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    import Zap from "./Zap.svelte";
    import Like from "./Like.svelte";
    import CopyId from "./CopyId.svelte";
    import Fork from "./Fork.svelte";
    import Delete from "./Delete.svelte";
    import Edit from "./Edit.svelte";

    export let nip19: string;
    export let listId: string;
    export let pubkey: string;
</script>

{#if $currentUser}
    <div class="flex flex-row gap-4 items-center">
        <Zap {nip19} {listId} />
        <Like {listId} />
        <CopyId {nip19} />
        <Fork {listId} />
        <Edit {listId} {pubkey} />
        <Delete {listId} {pubkey} />
    </div>
{/if}
