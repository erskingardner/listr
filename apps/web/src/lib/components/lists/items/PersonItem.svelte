<script lang="ts">
    import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";
    import ndk from "$lib/stores/ndk";
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import Nip05 from "$lib/components/users/Nip05.svelte";

    export let type: string;
    export let pubkey: string;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;

    const user = $ndk.getUser({ hexpubkey: pubkey });
</script>

{#key pubkey}
    <div
        class="flex flex-row gap-2 rounded-md p-2 my-2 items-center border border-gray-200 {unsaved
            ? 'border-orange-500 border-dashed'
            : ''}"
    >
        <a href="/{user.npub}" class="grow flex flex-row gap-2 items-center">
            <Avatar ndk={$ndk} {pubkey} class="w-12 h-12 rounded-full" />
            <div class="flex flex-col gap-1">
                <Name ndk={$ndk} {pubkey} npubMaxLength={9} class="font-medium hover:underline" />
                {#await user.fetchProfile() then value}
                    {#if user.profile?.nip05}
                        <Nip05 pubkey={user.hexpubkey()} nip05={user.profile.nip05} />
                    {/if}
                {/await}
            </div>
            {#if privateItem}
                <PrivateItemPill />
            {/if}
            {#if removal}
                <RemovalItemPill />
            {/if}
        </a>
        <ItemActions {type} id={pubkey} {privateItem} {unsaved} {removal} on:removeItem />
    </div>
{/key}
