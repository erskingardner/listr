<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";
    import { timeAgo } from "$lib/utils";

    export let name: string | undefined;
    export let kind: number | undefined;
    export let date: number | undefined;
    export let listNip19: string;
    export let authorPubkey: string;

    const timeInPast = timeAgo(date as number);
    const user = $ndk.getUser({ hexpubkey: authorPubkey });
</script>

<div class="flex flex-row gap-1 items-center p-2 border-b border-gray-200">
    <div class="flex flex-row gap-2 items-center">
        <Avatar
            ndk={$ndk}
            pubkey={authorPubkey}
            class="w-8 h-8 rounded-full border border-gray-300 shadow-sm shrink-0"
        />
        <a href="/{user.npub}/{kind}/{listNip19}" class="font-medium">
            <Name ndk={$ndk} pubkey={authorPubkey} npubMaxLength={9} class="break-all" />
        </a>
    </div>
    updated their<span class="font-medium">{name}</span> list (k: {kind})
    <div class="text-sm ml-auto">{timeInPast}</div>
</div>
