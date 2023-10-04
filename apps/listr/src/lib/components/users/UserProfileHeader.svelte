<script lang="ts">
    import { Avatar, Name, Nip05 } from "@nostr-dev-kit/ndk-svelte-components";
    import { BadgeHelp, BadgeCheck, BadgeX } from "lucide-svelte";
    import CopyId from "../lists/actions/CopyId.svelte";
    import ndk from "$lib/stores/ndk";
    import FollowButton from "../lists/actions/FollowButton.svelte";
    import AddToListButton from "../lists/actions/AddToListButton.svelte";
    import ZapUserButton from "../lists/actions/ZapUserButton.svelte";

    export let pubkey: string;

    const user = $ndk.getUser({ hexpubkey: pubkey });

    const defaultBannerImage = "/images/default-banner.webp";
</script>

<div class="relative w-full mb-14">
    {#await user.fetchProfile()}
        <!-- user.fetchProfile() is pending -->
    {:then profile}
        <div
            class="absolute inset-0 w-full min-h-[286px] h-full bg-center bg-cover z-0 rounded-lg"
            style={`background-image: url(${profile?.banner || defaultBannerImage})`}
        />
        <div
            class="z-1 absolute py-6 inset-0 w-full min-h-[286px] h-full
bg-gradient-to-b from-transparent via-80% via-white dark:via-gray-800 to-white dark:to-gray-800"
        />
        <div class="relative profileMetadata flex flex-col gap-2 pt-10 mx-6">
            <Avatar
                ndk={$ndk}
                {pubkey}
                userProfile={profile || undefined}
                class="w-36 h-36 border-zinc-100 object-cover rounded-full dark:!bg-gray-800 shadow-3xl"
            />
            <h1 class="text-2xl font-bold">
                <Name ndk={$ndk} {pubkey} userProfile={profile || undefined} />
            </h1>
            <Nip05
                ndk={$ndk}
                {user}
                userProfile={profile || undefined}
                {pubkey}
                class="flex flex-row gap-1 items-center text-base truncate"
                nip05MaxLength={28}
            >
                <span slot="badge" let:nip05Valid>
                    {#if nip05Valid === undefined}
                        <BadgeHelp
                            size="16"
                            strokeWidth="1.5"
                            class="fill-gray-200 stroke-gray-600 w-4 h-4"
                        />
                    {:else if nip05Valid}
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
                </span>
            </Nip05>

            <span class="text-sm flex flex-row gap-1 items-center truncate">
                <span class="truncate">{user.npub}</span>
                <div class="shrink">
                    <CopyId
                        nip19={user.npub}
                        size="20"
                        showText={false}
                        class="hover:bg-transparent dark:hover:bg-transparent"
                    />
                </div>
            </span>
            <div class="flex flex-col gap-4 lg:flex-row justify-between">
                <div class="leading-relaxed break-words max-w-xl">{profile?.about}</div>
                <div class="flex flex-row gap-4">
                    <ZapUserButton
                        {user}
                        class="primaryActionButton w-full whitespace-nowrap justify-start h-fit !py-2"
                    />
                    <FollowButton {user} class="!justify-start h-fit !py-2" />
                    <AddToListButton {user} class="!justify-start h-fit !py-2" />
                </div>
            </div>
        </div>
    {:catch error}
        <!-- user.fetchProfile() was rejected -->
    {/await}
</div>
