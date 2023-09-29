<script lang="ts">
    import { copyToClipboard } from "$lib/utils";
    import type { NostrEvent } from "@nostr-dev-kit/ndk";
    import { CheckCircle, Share } from "lucide-svelte";
    import { page } from "$app/stores";
    import ndk from "$lib/stores/ndk";
    import { Popover } from "flowbite-svelte";

    export let pubkey: string;
    export let rawList: NostrEvent;
    export let nip19: string;

    let tooltipVisible: boolean = false;
    const user = $ndk.getUser({ hexpubkey: pubkey });

    async function copyShareUrl() {
        tooltipVisible = true;
        await copyToClipboard(`https://${$page.url.host}/${user.npub}/${rawList.kind}/${nip19}`);
        setTimeout(() => (tooltipVisible = false), 1500);
    }
</script>

<div class="relative">
    <button id="shareButton" class="primaryActionButton" on:click={copyShareUrl}>
        <Share strokeWidth="1.5" size="20" class="w-5 h-5" />
        Share
    </button>
    {#if tooltipVisible}
        <div
            class="py-1 px-1.5 whitespace-nowrap rounded-md dark:bg-gray-700 bg-p-2 text-sm text-green-600 flex flex-row gap-2 items-center absolute left-1/2 -top-10 -translate-x-1/2"
        >
            <CheckCircle strokeWidth="1.5" size="16" />
            URL copied!
        </div>
    {/if}
</div>
