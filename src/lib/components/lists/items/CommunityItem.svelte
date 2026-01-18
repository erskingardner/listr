<script lang="ts">
import type { NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { User } from "$lib/ndk/ui/user";
import ndk from "$lib/stores/ndk.svelte";

let { name, creator }: { name: string; creator: NDKUser } = $props();

// Cast ndk to NDKSvelte for component compatibility
const ndkSvelte = ndk as unknown as NDKSvelte;
</script>

{#key name}
    <span class="break-all text-sm lg:text-base">
        <span class="font-semibold">{name}</span>
        <span class="italic text-sm">created by</span>
        <a href="/{creator.npub}" class="hover:underline">
            <User.Root ndk={ndkSvelte} user={creator}>
                <User.Name />
            </User.Root>
        </a>
    </span>
{/key}
