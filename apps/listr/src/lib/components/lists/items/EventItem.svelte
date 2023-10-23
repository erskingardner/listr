<script lang="ts">
    import { EventContent } from "@nostr-dev-kit/ndk-svelte-components";
    import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import { timeAgo } from "$lib/utils";
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import UserDetails from "$lib/components/users/UserDetails.svelte";
    import RemoveItem from "../actions/RemoveItem.svelte";
    import Unstage from "../actions/Unstage.svelte";
    import AdditionItemPill from "./AdditionItemPill.svelte";

    export let type: string;
    export let id: string;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;
    export let editMode: boolean;

    let event: NDKEvent | null;
    let user: NDKUser | null;

    let createdTime: number;

    async function fetchEventAndUser() {
        event = await $ndk.fetchEvent(id);
        user = $ndk.getUser({ hexpubkey: event?.pubkey });
        createdTime = event?.created_at as number;
    }

    fetchEventAndUser();
</script>

{#key id}
    {#if event && user}
        <div
            class="flex flex-col gap-6 border rounded-md p-2 my-2
            {unsaved
                ? 'border-gray-500/60 dark:border-gray-100/30 border-dashed'
                : 'border-gray-200 dark:border-gray-700'}"
        >
            <div class="flex flex-row gap-2 items-center">
                <a href="/{user?.npub}" class="flex flex-row gap-2 items-center">
                    <UserDetails {user} />
                </a>
                {#if privateItem}
                    <PrivateItemPill />
                {/if}
                <div class="flex flex-row gap-2 items-center ml-auto text-sm">
                    {#if unsaved}
                        {#if removal}
                            <RemovalItemPill />
                        {:else}
                            <AdditionItemPill />
                        {/if}
                        <Unstage
                            {type}
                            {id}
                            {privateItem}
                            {unsaved}
                            {removal}
                            on:removeUnsavedItem
                        />
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
                        <div title={`${new Date(createdTime)}`}>{timeAgo(createdTime)}</div>
                        <ItemActions {type} {id} on:removeItem />
                    {/if}
                </div>
            </div>
            <div class="break-words lg:w-2/3">
                <EventContent ndk={$ndk} {event} />
            </div>
        </div>
    {/if}
{/key}
