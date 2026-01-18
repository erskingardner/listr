<script lang="ts">
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import { UserRoundMinus, UserRoundPlus } from "lucide-svelte";
import toast from "svelte-hot-french-toast";
import ndk from "$lib/stores/ndk.svelte";

let { user, buttonClasses }: { user: NDKUser; buttonClasses?: string } = $props();

let currentUser = $derived(ndk.$currentUser);
let isFollowing = $derived(ndk.$follows.has(user.pubkey));
let followingButtonText = $state("Following");

async function handleFollow() {
    if (!currentUser) return;
    const followResult = await ndk.$follows.add(user.pubkey);
    if (followResult) {
        toast.success("Successfully followed");
    } else {
        toast("You're already following that user or we couldn't follow them, try again later.");
    }
}

async function handleUnfollow() {
    if (!currentUser) return;
    const unfollowResult = await ndk.$follows.remove(user.pubkey);
    if (unfollowResult) {
        toast.success("Successfully unfollowed");
    } else {
        toast("You weren't following that user or we couldn't unfollow them, try again later.");
    }
}
</script>

{#key user.pubkey}
    {#if currentUser}
        {#if isFollowing}
            <button
                onclick={handleUnfollow}
                onmouseenter={() => (followingButtonText = "Unfollow")}
                onmouseleave={() => (followingButtonText = "Following")}
                class="primaryActionButton bg-white text-indigo-700 border-indigo-400 hover:bg-red-50 hover:text-red-700 hover:border-red-400 dark:bg-white dark:text-indigo-700 dark:border-indigo-400 dark:hover:bg-red-50 dark:hover:text-red-700 dark:hover:border-red-400 w-full justify-center {buttonClasses}"
            >
                <UserRoundMinus size="20" strokeWidth="1.5" class="w-5 h-5" />
                <span class="w-16 text-left">{followingButtonText}</span>
            </button>
        {:else}
            <button
                onclick={handleFollow}
                class="primaryActionButton w-full justify-center {buttonClasses}"
            >
                <UserRoundPlus size="20" strokeWidth="1.5" class="w-5 h-5" />
                Follow
            </button>
        {/if}
    {:else}
        <button class="primaryActionButton w-full justify-center {buttonClasses}">
            <UserRoundPlus size="20" strokeWidth="1.5" class="w-5 h-5" />
            Follow
        </button>
        <Tooltip type="auto" class="dark:border-gray-800 dark:text-gray-50 shadow-md">
            Sign in to follow
        </Tooltip>
    {/if}
{/key}
