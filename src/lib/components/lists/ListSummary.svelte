<script lang="ts">
    import listsStore from "$lib/stores/lists";
    import ndk from "$lib/stores/ndk";
    import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";

    export let name: string | undefined;
    export let kind: number | undefined;
    export let authorPubkey: string;

    const user = $ndk.getUser({ hexpubkey: authorPubkey });
</script>

<div class="flex flex-row gap-4 items-center p-2 border border-gray-300 shadow-sm">
    <Avatar
        ndk={$ndk}
        pubkey={authorPubkey}
        class="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
    />
    <Name ndk={$ndk} pubkey={authorPubkey} />
    {name} (Kind: {kind})
</div>
