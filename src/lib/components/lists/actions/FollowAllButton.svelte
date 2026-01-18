<script lang="ts">
import type { NDKTag } from "@nostr-dev-kit/ndk";
import { Modal } from "flowbite-svelte";
import { UsersRound } from "lucide-svelte";
import toast from "svelte-hot-french-toast";
import ndk from "$lib/stores/ndk.svelte";

let { publicItems, extraClasses = "" }: { publicItems: NDKTag[]; extraClasses?: string } = $props();

let currentUser = $derived(ndk.$currentUser);
let modalOpen = $state(false);
let isFollowing = $state(false);

/**
 * Extract all pubkeys from p-tags in the list, excluding the current user
 */
let userPubkeys = $derived.by(() => {
    return publicItems
        .filter((tag) => tag[0] === "p")
        .map((tag) => tag[1])
        .filter((pubkey) => pubkey !== currentUser?.pubkey);
});

/**
 * Filter to only pubkeys the user is not already following
 */
let notFollowingPubkeys = $derived.by(() => {
    return userPubkeys.filter((pubkey) => !ndk.$follows.has(pubkey));
});

/**
 * Count of users already being followed
 */
let alreadyFollowingCount = $derived(userPubkeys.length - notFollowingPubkeys.length);

/**
 * Follow all users in the list at once (single event publish)
 */
async function handleFollowAll() {
    if (!currentUser || notFollowingPubkeys.length === 0) return;

    isFollowing = true;
    try {
        // Use batch add - this publishes a single kind 3 event
        const result = await ndk.$follows.add(notFollowingPubkeys);
        if (result) {
            toast.success(`Successfully followed ${notFollowingPubkeys.length} users`);
            modalOpen = false;
        } else {
            toast.error("Failed to follow users. Please try again.");
        }
    } catch (error) {
        console.error("Error following users:", error);
        toast.error("Something went wrong. Please try again.");
    } finally {
        isFollowing = false;
    }
}
</script>

{#if currentUser && userPubkeys.length > 0}
    <button
        onclick={() => (modalOpen = true)}
        class="primaryActionButton {extraClasses}"
        disabled={notFollowingPubkeys.length === 0}
    >
        <UsersRound strokeWidth="1.5" size="20" class="w-5 h-5" />
        {#if notFollowingPubkeys.length === 0}
            Following all
        {:else}
            Follow all
        {/if}
    </button>

    <Modal
        title="Follow all users in this list"
        bind:open={modalOpen}
        placement="top-center"
        size="sm"
    >
        <div class="flex flex-col gap-4">
            <p class="text-gray-900 dark:text-white">
                This will add <span class="font-bold">{notFollowingPubkeys.length}</span> users to your
                follow list.
            </p>
            {#if alreadyFollowingCount > 0}
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    You're already following {alreadyFollowingCount} of {userPubkeys.length} users in this
                    list.
                </p>
            {/if}
            <div class="flex flex-row gap-3 justify-end mt-2">
                <button
                    onclick={() => (modalOpen = false)}
                    class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                    Cancel
                </button>
                <button
                    onclick={handleFollowAll}
                    disabled={isFollowing}
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {#if isFollowing}
                        <span class="animate-spin">⏳</span>
                        Following...
                    {:else}
                        <UsersRound strokeWidth="1.5" size="16" class="w-4 h-4" />
                        Follow {notFollowingPubkeys.length} users
                    {/if}
                </button>
            </div>
        </div>
    </Modal>
{/if}
