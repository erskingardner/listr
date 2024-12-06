<script lang="ts">
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import { UserRoundMinus, UserRoundPlus } from "lucide-svelte";
import toast from "svelte-hot-french-toast";

let { user, buttonClasses }: { user: NDKUser; buttonClasses?: string } = $props();

let currentUser = $derived(getCurrentUser());
let followingButtonText = $state("Following");

async function handleFollow() {
    if (!currentUser?.user) return;
    const followResult = await currentUser.follow(user);
    if (followResult) {
        toast.success("Successfully followed");
    } else {
        toast("You're already following that user or we couldn't follow them, try again later.");
    }
}

async function handleUnfollow() {
    if (!currentUser?.user) return;
    const unfollowResult = await currentUser.unfollow(user);
    if (unfollowResult) {
        toast.success("Successfully unfollowed");
    } else {
        toast("You weren't following that user or we couldn't unfollow them, try again later.");
    }
}
</script>

{#key user.pubkey}
    {#if currentUser?.user}
        {#if currentUser.follows.includes(user.pubkey)}
            <button
                onclick={handleUnfollow}
                onmouseenter={() => (followingButtonText = "Unfollow")}
                onmouseleave={() => (followingButtonText = "Following")}
                class="primaryActionButton bg:white hover:bg-white hover:text-red-700 hover:border-red-700 dark:bg-white dark:text-indigo-800 hover:dark:border-red-700 hover:dark:text-red-700 w-full hover:dark:bg-white justify-center {buttonClasses}"
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
