<script lang="ts">
import { NDKEvent, NDKKind, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { Popover } from "flowbite-svelte";
import { Heart } from "lucide-svelte";
import ndk from "$lib/stores/ndk.svelte";
import { unixTimeNowInSeconds } from "$lib/utils";

let { listId }: { listId: string } = $props();

let currentUser = $derived(ndk.$currentUser);
let likesSub = ndk.$subscribe(() => ({
    filters: [{ kinds: [NDKKind.Reaction], "#a": [listId as string] }],
}));
let likes = $derived(likesSub.events);
let alreadyLiked = $derived(
    currentUser && likes.map((like) => like.pubkey).includes(currentUser.pubkey)
);

function likeList() {
    if (currentUser) {
        if (!ndk.signer) {
            const signer = new NDKNip07Signer();
            ndk.signer = signer;
        }

        // For now, don't worry about "unliking" a list.
        if (!alreadyLiked) {
            // Create and publish a reaction event (kind 7)
            const likeEvent = new NDKEvent(ndk, {
                kind: 7,
                content: "+",
                pubkey: currentUser.pubkey,
                created_at: unixTimeNowInSeconds(),
                tags: [
                    ["a", listId as string],
                    ["p", currentUser.pubkey],
                ],
            });
            likeEvent.publish().catch((error) => {
                console.error(error);
            });
        }
    }
}
</script>

<button
    onclick={likeList}
    id="likeButton"
    class="flex flex-row gap-1 items-center text-sm lg:text-base"
>
    <Heart
        strokeWidth="1.5"
        class="{alreadyLiked
            ? 'fill-red-500 stroke-red-500'
            : 'stroke-gray-500'} hover:fill-red-500 hover:stroke-red-500 w-4 lg:w-5 h-4 lg:h-5"
    />
    {likes.length > 0 ? likes.length : 0}
</button>
{#if !currentUser}
    <Popover
        triggeredBy="#likeButton"
        trigger="click"
        placement="left-end"
        class="dark:text-gray-50 dark:bg-gray-700"
    >
        <div class="panel-contents flex flex-col gap-2">Please sign in to like.</div>
    </Popover>
{/if}
