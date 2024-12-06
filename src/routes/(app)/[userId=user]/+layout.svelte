<script lang="ts">
import { page } from "$app/stores";
import UserProfileHeader from "$lib/components/users/UserProfileHeader.svelte";
import ndk from "$lib/stores/ndk.svelte";
import type { NDKUser } from "@nostr-dev-kit/ndk";

let { children } = $props();

let user: NDKUser = $derived(ndk.getUser({ npub: $page.params.userId }));
</script>

{#if user}
    {#key user.pubkey}
        <UserProfileHeader pubkey={user.pubkey} />
    {/key}
{/if}

{@render children()}

<style lang="postcss">
    * > :global(.userCard--avatar) {
        @apply w-10 h-10;
    }

    * > :global(.userCard--details) {
        @apply w-full;
    }
</style>
