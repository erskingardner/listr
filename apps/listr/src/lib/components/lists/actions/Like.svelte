<script lang="ts">
    import { Heart } from "lucide-svelte";
    import { onMount, beforeUpdate, onDestroy } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
    import { NDKEvent, NDKNip07Signer, NDKKind } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { unixTimeNowInSeconds } from "$lib/utils";

    export let listId: string;

    let alreadyLiked: boolean;
    let likes: NDKEventStore<ExtendedBaseType<NDKEvent>>;

    onMount(() => {
        likes = $ndk.storeSubscribe(
            { kinds: [NDKKind.Reaction], "#a": [listId as string] },
            { closeOnEose: false }
        );
    });

    beforeUpdate(() => likes?.unsubscribe());
    onDestroy(() => likes?.unsubscribe());

    afterNavigate(() => {
        likes = $ndk.storeSubscribe(
            { kinds: [NDKKind.Reaction], "#a": [listId as string] },
            { closeOnEose: false }
        );
    });

    $: alreadyLiked =
        !!$currentUser && $likes?.map((like) => like.pubkey).includes($currentUser?.hexpubkey);

    function likeList() {
        if (!$ndk.signer) {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
        }

        // For now, don't worry about "unliking" a list.
        if (!alreadyLiked) {
            // Create and publish a reaction event (kind 7)
            const likeEvent = new NDKEvent($ndk, {
                kind: 7,
                content: "+",
                pubkey: $currentUser?.hexpubkey as string,
                created_at: unixTimeNowInSeconds(),
                tags: [
                    ["e", listId as string],
                    ["a", listId as string],
                    ["p", $currentUser?.hexpubkey as string],
                ],
            });
            likeEvent
                .publish()
                .then(() => {
                    alreadyLiked = true;
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
</script>

<button on:click={likeList} class="flex flex-row gap-1 items-center text-sm lg:text-base">
    <Heart
        strokeWidth="1.5"
        class="{alreadyLiked
            ? 'fill-red-500 stroke-red-500'
            : 'stroke-gray-500'} hover:fill-red-500 hover:stroke-red-500 w-4 lg:w-5 h-4 lg:h-5"
    />
    {$likes?.length > 0 ? $likes.length : 0}
</button>
