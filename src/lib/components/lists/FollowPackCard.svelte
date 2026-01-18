<script lang="ts">
import type { NDKList, NDKTag } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { fade } from "svelte/transition";
import { User } from "$lib/ndk/ui/user";
import ndk from "$lib/stores/ndk.svelte";
import { getListDisplayTitle } from "$lib/utils/lists";
import FollowAllButton from "./actions/FollowAllButton.svelte";

let { list }: { list: NDKList } = $props();

const ndkSvelte = ndk as unknown as NDKSvelte;

const displayTitle = $derived(getListDisplayTitle(list));
const coverImage = $derived(list.tagValue("image"));
const description = $derived(list.description);

// Get users in the pack
const publicItems = $derived(list.items || []);
const userPubkeys = $derived(publicItems.filter((tag) => tag[0] === "p").map((tag) => tag[1]));

// Preview users (max 5)
const previewPubkeys = $derived(userPubkeys.slice(0, 5));
const remainingCount = $derived(Math.max(0, userPubkeys.length - 5));

const link = $derived(`/${list.author.npub}/${list.kind}/${list.encode()}`);
</script>

<div
    class="flex flex-col border border-gray-300 rounded-md shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 overflow-hidden hover:shadow-lg transition-shadow"
>
    <!-- Cover Image or Placeholder -->
    <a href={link} class="h-32 w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden block">
        {#if coverImage}
            <img
                src={coverImage}
                alt={displayTitle}
                class="w-full h-full object-cover"
                loading="lazy"
            />
        {:else}
            <!-- Generative pattern placeholder could go here, for now just a gradient -->
            <div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50"></div>
        {/if}
        
        <!-- Author Avatar (floating) -->
        <div class="absolute bottom-2 left-4">
            <User.Root ndk={ndkSvelte} pubkey={list.pubkey}>
                <div class="flex items-center gap-2 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full p-1 pr-3 border border-gray-200 dark:border-gray-600">
                    <User.Avatar class="w-6 h-6 rounded-full" />
                    <span class="text-xs font-medium truncate max-w-[100px]"><User.Name /></span>
                </div>
            </User.Root>
        </div>
    </a>

    <div class="p-4 flex flex-col gap-3 grow">
        <div>
            <a href={link} class="text-lg font-bold hover:underline line-clamp-1" title={displayTitle}>
                {displayTitle}
            </a>
            {#if description}
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 h-10">
                    {description}
                </p>
            {:else}
                <div class="h-10"></div>
            {/if}
        </div>

        <!-- Users Preview -->
        <div class="flex items-center -space-x-3 overflow-hidden py-1 pl-1">
            {#each previewPubkeys as pubkey}
                <User.Root ndk={ndkSvelte} {pubkey}>
                    <User.Avatar 
                        class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 object-cover" 
                    />
                </User.Root>
            {/each}
            {#if remainingCount > 0}
                <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 text-xs font-medium z-10">
                    +{remainingCount}
                </div>
            {/if}
            {#if userPubkeys.length === 0}
                <span class="text-xs text-gray-400 italic">No users in pack</span>
            {/if}
        </div>

        <div class="mt-auto pt-2 flex flex-row justify-between items-center">
            <span class="text-xs text-gray-500 dark:text-gray-400">
                {userPubkeys.length} {userPubkeys.length === 1 ? 'account' : 'accounts'}
            </span>
            
            <div role="none" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
                <FollowAllButton {publicItems} />
            </div>
        </div>
    </div>
</div>
