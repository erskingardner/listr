<script lang="ts">
import type { NDKUser } from "@nostr-dev-kit/ndk";
import UserProfileHeader from "#lib/components/users/UserProfileHeader.svelte";
import ndk from "#lib/stores/ndk.svelte.ts";
import { page } from "$app/state";

let { children } = $props();

let user: NDKUser = $derived(ndk.getUser({ npub: page.params.userId }));
</script>

{#if user}
    {#key user.pubkey}
        <UserProfileHeader pubkey={user.pubkey} />
    {/key}
{/if}

{@render children()}
