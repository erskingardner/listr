<script lang="ts">
    import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";
    import ndk from "$lib/stores/ndk";
    import { BadgeCheck } from "lucide-svelte";
    import { Tooltip } from "flowbite-svelte";
    import { prettifyNip05 } from "@nostr-dev-kit/ndk-svelte-components";

    export let pubkey: string;
    export let privateItem: boolean;

    const user = $ndk.getUser({ hexpubkey: pubkey });
</script>

{#key pubkey}
    <a
        class="flex flex-row gap-2 rounded-md p-2 my-2 items-center border border-gray-200"
        href="/{user.npub}"
    >
        <Avatar ndk={$ndk} {pubkey} class="w-12 h-12 rounded-full" />
        <div class="flex flex-col gap-1">
            <Name ndk={$ndk} {pubkey} npubMaxLength={9} class="font-medium" />
            {#await user.fetchProfile() then value}
                {#if user.profile?.nip05}
                    <span
                        class="flex flex-row gap-1 items-center text-xs whitespace-nowrap min-w-0 overflow-hidden text-ellipsis"
                    >
                        <BadgeCheck
                            size="16"
                            strokeWidth="1.5"
                            class="fill-purple-200 stroke-purple-800"
                        />
                        {prettifyNip05(user.profile?.nip05)}
                    </span>
                {/if}
            {/await}
        </div>
        {#if privateItem}
            <span
                class="text-2xs text-white md:text-xs px-1.5 md:px-2 md:py-0.5 bg-indigo-600 rounded-full"
            >
                Private
            </span>
            <Tooltip type="light">Encrypted item only visible to you.</Tooltip>
        {/if}
    </a>
{/key}
