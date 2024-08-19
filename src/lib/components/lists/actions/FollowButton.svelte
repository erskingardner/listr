<script lang="ts">
    import { UserMinus2, UserPlus2 } from "lucide-svelte";
    import currentUser from "$lib/stores/currentUser";
    import { currentUserFollows } from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import toast from "svelte-french-toast";
    import { NDKEvent, NDKKind, NDKNip07Signer, type NDKTag } from "@nostr-dev-kit/ndk";
    import { unixTimeNowInSeconds } from "$lib/utils";
    import { Tooltip } from "flowbite-svelte";

    export let user: NDKUser;

    async function handleFollow() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        const followResult = await $currentUser?.follow(user);
        if (followResult) {
            toast.success("Successfully followed");
            const followsSet = await $currentUser?.follows();
            const followsArray = Array.from(followsSet as Set<NDKUser>);
            $currentUserFollows = followsArray.map((user) => user.pubkey);
        } else {
            toast("You're already following them");
        }
    }

    async function handleUnfollow() {
        const newFollowsArray = $currentUserFollows.filter((pubkey) => pubkey !== user.pubkey);
        const tags: NDKTag[] = newFollowsArray.map((pubkey) => ["p", pubkey] as NDKTag);

        const event = new NDKEvent($ndk, {
            pubkey: $currentUser!.pubkey,
            kind: NDKKind.Contacts,
            tags: tags,
            created_at: unixTimeNowInSeconds(),
            content: "",
        });

        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        event.publish().then(() => {
            $currentUserFollows = newFollowsArray;
        });
    }
    let followingButtonText: string = "Following";
</script>

{#key user.pubkey}
    {#if $currentUser}
        {#if $currentUserFollows.includes(user.pubkey)}
            <button
                on:click={handleUnfollow}
                on:mouseenter={() => (followingButtonText = "Unfollow")}
                on:mouseleave={() => (followingButtonText = "Following")}
                class="primaryActionButton bg:white hover:bg-white hover:text-red-700 hover:border-red-700 dark:bg-white dark:text-indigo-800 hover:dark:border-red-700 hover:dark:text-red-700 w-full hover:dark:bg-white justify-center {$$props.class}"
            >
                <UserMinus2 size="20" strokeWidth="1.5" class="w-5 h-5" />
                <span class="w-16 text-left">{followingButtonText}</span>
            </button>
        {:else}
            <button
                on:click={handleFollow}
                class="primaryActionButton w-full justify-center {$$props.class}"
            >
                <UserPlus2 size="20" strokeWidth="1.5" class="w-5 h-5" />
                Follow
            </button>
        {/if}
    {:else}
        <button class="primaryActionButton w-full justify-center {$$props.class}">
            <UserPlus2 size="20" strokeWidth="1.5" class="w-5 h-5" />
            Follow
        </button>
        <Tooltip type="auto" class="dark:border-gray-800 dark:text-gray-50 shadow-md">
            Sign in to follow
        </Tooltip>
    {/if}
{/key}
