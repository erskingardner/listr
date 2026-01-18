<script lang="ts">
import UserDetails from "$lib/components/users/UserDetails.svelte";
import ndk from "$lib/stores/ndk.svelte";
import type { ListItemParams } from "$lib/types";
import { timeAgo } from "$lib/utils";
import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { EventContent } from "@nostr-dev-kit/ndk-svelte-components";
import RemoveItem from "../actions/RemoveItem.svelte";
import Unstage from "../actions/Unstage.svelte";
import AdditionItemPill from "./AdditionItemPill.svelte";
import ItemActions from "./ItemActions.svelte";
import PrivateItemPill from "./PrivateItemPill.svelte";
import RemovalItemPill from "./RemovalItemPill.svelte";

let {
    type,
    id,
    privateItem,
    otherTagValues,
    unsaved,
    removal,
    editMode,
    removeItem,
    removeUnsavedItem,
}: {
    type: string;
    id: string;
    privateItem: boolean;
    otherTagValues: string[] | undefined;
    unsaved: boolean;
    removal: boolean;
    editMode: boolean;
    removeItem: (params: ListItemParams) => void;
    removeUnsavedItem: (params: ListItemParams) => void;
} = $props();

let event: NDKEvent | null = $state(null);
let user: NDKUser | null = $state(null);
let createdTime: number | undefined = $state(undefined);

$effect(() => {
    ndk.fetchEvent(id).then((fetchedEvent: NDKEvent | null) => {
        event = fetchedEvent;
        if (fetchedEvent) {
            user = ndk.getUser({ pubkey: fetchedEvent.pubkey });
            createdTime = fetchedEvent.created_at;
        }
    });
});
</script>

{#key id}
    {#if event && user && createdTime}
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
                            {otherTagValues}
                            {unsaved}
                            {removal}
                            {removeUnsavedItem}
                        />
                    {:else}
                        <RemoveItem
                            {type}
                            {id}
                            {privateItem}
                            {otherTagValues}
                            {unsaved}
                            {removal}
                            {editMode}
                            {removeItem}
                        />
                        <div title={`${new Date(createdTime)}`}>{timeAgo(createdTime)}</div>
                        <ItemActions {type} {id} />
                    {/if}
                </div>
            </div>
            <div class="wrap-break-word lg:w-2/3">
                <EventContent ndk={ndk as any} event={event as any} />
            </div>
        </div>
    {/if}
{/key}
