<script lang="ts">
import UserName from "$lib/components/users/UserName.svelte";
import type { NDKUser } from "@nostr-dev-kit/ndk";

let { name, creator }: { name: string; creator: NDKUser } = $props();
</script>

{#key name}
    <span class="break-all text-sm lg:text-base">
        <span class="font-semibold">{name}</span>
        <span class="italic text-sm">created by</span>
        <a href="/{creator.npub}" class="hover:underline">
            <UserName user={creator} />
        </a>
    </span>
{/key}
