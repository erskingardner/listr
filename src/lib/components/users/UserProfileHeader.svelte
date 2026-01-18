<script lang="ts">
import ndk from "$lib/stores/ndk.svelte";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { BadgeCheck, BadgeHelp, BadgeX } from "lucide-svelte";
import AddToListButton from "../lists/actions/AddToListButton.svelte";
import CopyId from "../lists/actions/CopyId.svelte";
import FollowButton from "../lists/actions/FollowButton.svelte";
import ZapUserButton from "../lists/actions/ZapUserButton.svelte";
import UserAvatar from "./UserAvatar.svelte";
import UserName from "./UserName.svelte";
import UserNip05 from "./UserNip05.svelte";

let { pubkey }: { pubkey: string } = $props();

const defaultBannerImage = "/images/default-banner.webp";
let user = $derived(ndk.getUser({ pubkey: pubkey }));
let profile: NDKUserProfile | null = $state(null);

$effect(() => {
    if (!profile) {
        user.fetchProfile().then((userProfile) => {
            profile = userProfile;
        });
    }
});
</script>

<div class="relative w-full mb-14">
        <div
            class="absolute inset-0 w-full min-h-[286px] h-full bg-center bg-cover z-0 rounded-lg"
            style={`background-image: url(${profile?.banner || defaultBannerImage})`}
        ></div>
        <div
            class="z-1 absolute py-6 inset-0 w-full min-h-[286px] h-full
bg-linear-to-b from-transparent via-80% via-white dark:via-gray-800 to-white dark:to-gray-800"
        ></div>
        <div class="relative profileMetadata flex flex-col gap-2 pt-10 mx-6">
            <UserAvatar
                {user}
                userProfile={profile || undefined}
                extraClasses="w-36 h-36 border-zinc-100 object-cover rounded-full dark:bg-gray-800! shadow-3xl"
            />
            <h1 class="text-2xl font-bold">
                <UserName user={user} userProfile={profile || undefined} />
            </h1>
            <UserNip05
                {user}
                userProfile={profile || undefined}
                extraClasses="flex flex-row gap-2 items-center"
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
                <div class="leading-relaxed wrap-break-word max-w-xl">{profile?.about}</div>
                <div class="flex flex-row gap-4">
                    <!-- <ZapUserButton {user} extraClasses="primaryActionButton w-full whitespace-nowrap justify-start h-fit py-2!" /> -->
                    <FollowButton {user} buttonClasses="justify-start! h-fit py-2!" />
                    <AddToListButton {user} extraClasses="justify-start! h-fit py-2!" />
            </div>
        </div>
    </div>
</div>
