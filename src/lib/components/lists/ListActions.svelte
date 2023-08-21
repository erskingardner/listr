<script lang="ts">
    import { copyToClipboard, unixTimeNowInSeconds } from "$lib/utils";
    import currentUser from "$lib/stores/currentUser";
    import { Tooltip } from "flowbite-svelte";
    import { Heart, Zap, FileEdit, FileX, Copy, CopyCheck, GitFork } from "lucide-svelte";
    import ndk from "$lib/stores/ndk";
    import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
    import { goto } from "$app/navigation";
    import { afterUpdate } from "svelte";

    export let nip19: string;
    export let listId: string | undefined;
    export let pubkey: string;

    let alreadyLiked: boolean;
    let copySuccess: boolean = false;

    async function copyListId() {
        copyToClipboard(nip19).then(() => {
            copySuccess = true;
            setTimeout(() => {
                copySuccess = false;
            }, 1500);
        });
    }

    async function checkForLikes() {
        if ($currentUser) {
            const likeFilter: NDKFilter = {
                kinds: [7],
                authors: [$currentUser.hexpubkey() as string],
                "#a": [listId as string],
            };
            const likeEvent = await $ndk.fetchEvent(likeFilter);
            alreadyLiked = !!likeEvent;
        }
    }

    function likeList() {
        // For now, don't worry about "unliking" a list.
        if (!alreadyLiked) {
            // Create and publish a reaction event (kind )
            const likeEvent = new NDKEvent($ndk, {
                kind: 7,
                content: "+",
                pubkey: $currentUser?.hexpubkey() as string,
                created_at: unixTimeNowInSeconds(),
                tags: [
                    ["e", listId as string],
                    ["a", listId as string],
                    ["p", $currentUser?.hexpubkey() as string],
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

    function deleteList(event: any) {
        // Create & publish list deletion event (kind 5)
        const deleteEvent = new NDKEvent($ndk, {
            kind: 5,
            pubkey: $currentUser?.hexpubkey() as string,
            content: "List deleted by owner",
            tags: [["a", listId as string]],
            created_at: unixTimeNowInSeconds(),
        });
        deleteEvent
            .publish()
            .then(() => {
                // TODO: Need to make sure deleted event doesn't show from cache
                goto(`/${$currentUser?.npub}`);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    afterUpdate(async () => {
        checkForLikes();
    });
</script>

{#if $currentUser}
    <div class="flex flex-row gap-4 items-center">
        <button>
            <Zap
                strokeWidth="1.5"
                size="20"
                class="hover:fill-yellow-500 stroke-gray-500 hover:stroke-black"
            />
        </button>
        <Tooltip type="light">Zap this list</Tooltip>
        <button on:click={likeList}>
            <Heart
                strokeWidth="1.5"
                size="20"
                class="stroke-gray-500 {alreadyLiked
                    ? 'fill-red-500 stroke-black'
                    : ''} hover:fill-red-500 hover:stroke-black"
            />
        </button>
        <Tooltip type="light">Like this list</Tooltip>
        <button on:click={copyListId}>
            {#if copySuccess}
                <CopyCheck strokeWidth="1.5" size="20" class="stroke-green-500" />
            {:else}
                <Copy strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
            {/if}
        </button>
        <Tooltip type="light">Copy list ID</Tooltip>
        <button on:click={() => console.log("Implement fork list")}>
            <GitFork strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
        </button>
        <Tooltip type="light">Fork this list (create a personal copy)</Tooltip>
        {#if $currentUser.hexpubkey() === pubkey}
            <button>
                <FileEdit strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
            </button>
            <Tooltip type="light">Edit this list</Tooltip>
            <button on:click={deleteList}>
                <FileX strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
            </button>
            <Tooltip type="light">Delete this list</Tooltip>
        {/if}
    </div>
{/if}
