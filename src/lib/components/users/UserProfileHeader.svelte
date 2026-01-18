<script lang="ts">
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { BadgeCheck, BadgeHelp, BadgeX } from "lucide-svelte";
import { User } from "$lib/ndk/ui/user";
import ndk from "$lib/stores/ndk.svelte";
import AddToListButton from "../lists/actions/AddToListButton.svelte";
import CopyId from "../lists/actions/CopyId.svelte";
import FollowButton from "../lists/actions/FollowButton.svelte";

let { pubkey }: { pubkey: string } = $props();

// Cast ndk to NDKSvelte for component compatibility
const ndkSvelte = ndk as unknown as NDKSvelte;

const defaultBannerImage = "/images/default-banner.webp";
let user = $derived(ndk.getUser({ pubkey: pubkey }));
</script>

{#snippet verificationSnippet({ status, isVerifying }: { status: boolean | null | undefined; isVerifying: boolean })}
    {#if isVerifying || status === undefined}
        <BadgeHelp
            size="16"
            strokeWidth="1.5"
            class="fill-gray-200 stroke-gray-600 w-4 h-4"
        />
    {:else if status === true}
        <BadgeCheck
            size="16"
            strokeWidth="1.5"
            class="fill-purple-200 stroke-purple-800"
        />
    {:else}
        <BadgeX
            size="16"
            strokeWidth="1.5"
            class="fill-red-200 stroke-red-800 w-4 h-4"
        />
    {/if}
{/snippet}

<User.Root ndk={ndkSvelte} pubkey={pubkey}>
    <div class="relative w-full mb-14">
        <!-- Banner - positioned absolutely behind the content -->
        <User.Banner class="absolute inset-0 min-h-[286px] h-full bg-center bg-cover z-0 rounded-lg" />
        <!-- Gradient overlay -->
        <div
            class="z-1 absolute py-6 inset-0 w-full min-h-[286px] h-full
bg-linear-to-b from-transparent via-80% via-white dark:via-gray-800 to-white dark:to-gray-800"
        ></div>
        <!-- Profile content that overlaps the banner -->
        <div class="relative z-10 profileMetadata flex flex-col gap-2 pt-10 mx-6">
            <User.Avatar class="w-36 h-36 border-zinc-100 object-cover rounded-full dark:bg-gray-800 shadow-3xl" />
            <h1 class="text-2xl font-bold">
                <User.Name />
            </h1>
            <User.Nip05
                class="flex flex-row gap-2 items-center"
                showVerified={true}
                {verificationSnippet}
            />
            <span class="text-sm flex flex-row gap-1 items-center truncate">
                <span class="truncate">{user.npub}</span>
                <div class="shrink">
                    <CopyId
                        nip19={user.npub}
                        size="20"
                        showText={false}
                        extraClasses="hover:bg-transparent dark:hover:bg-transparent"
                    />
                </div>
            </span>
            <div class="flex flex-col gap-4 lg:flex-row justify-between">
                <User.Bio class="leading-relaxed wrap-break-word max-w-xl" />
                <div class="flex flex-row gap-4">
                    <FollowButton {user} buttonClasses="justify-start! h-fit py-2!" />
                    <AddToListButton {user} extraClasses="justify-start! h-fit py-2!" />
                </div>
            </div>
        </div>
    </div>
</User.Root>
