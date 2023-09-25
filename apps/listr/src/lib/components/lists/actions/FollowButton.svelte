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
            $currentUserFollows = followsArray.map((user) => user.hexpubkey);
        } else {
            toast("You're already following them");
        }
    }

    async function handleUnfollow() {
        const newFollowsArray = $currentUserFollows.filter((pubkey) => pubkey !== user.hexpubkey);
        const tags: NDKTag[] = newFollowsArray.map((pubkey) => ["p", pubkey] as NDKTag);

        const event = new NDKEvent($ndk, {
            pubkey: $currentUser!.hexpubkey,
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
</script>

{#if $currentUser}
    {#if $currentUserFollows.includes(user.hexpubkey)}
        <button on:click={handleUnfollow} class="primaryActionButton w-full justify-center">
            <UserMinus2 size="20" strokeWidth="1.5" class="w-5 h-5" />
            Unfollow
        </button>
    {:else}
        <button on:click={handleFollow} class="primaryActionButton w-full justify-center">
            <UserPlus2 size="20" strokeWidth="1.5" class="w-5 h-5" />
            Follow
        </button>
    {/if}
{:else}
    <button class="primaryActionButton w-full justify-center">
        <UserPlus2 size="20" strokeWidth="1.5" class="w-5 h-5" />
        Follow
    </button>
    <Tooltip type="light">Sign in to follow</Tooltip>
{/if}
