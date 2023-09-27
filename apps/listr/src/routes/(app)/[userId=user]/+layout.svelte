<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import { afterUpdate, onMount } from "svelte";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import { afterNavigate } from "$app/navigation";
    import UserProfileHeader from "$lib/components/users/UserProfileHeader.svelte";

    export let data;

    let user: NDKUser = $ndk.getUser({ hexpubkey: data.pubkey });

    onMount(() => {
        user = $ndk.getUser({ hexpubkey: data.pubkey });
    });

    afterUpdate(() => {
        if (user.hexpubkey !== data.pubkey) user = $ndk.getUser({ hexpubkey: data.pubkey });
    });

    afterNavigate(() => {
        if (user.hexpubkey !== data.pubkey) user = $ndk.getUser({ hexpubkey: data.pubkey });
    });
</script>

<svelte:head>
    {#await user.fetchProfile() then profile}
        <title>Listr: {profile?.displayName}</title>
        <meta
            name="description"
            content={`Listr user page showing all lists for ${profile?.displayName}`}
        />
    {/await}
</svelte:head>

{#key data.pubkey}
    <UserProfileHeader pubkey={data.pubkey} />
{/key}

<slot />

<style lang="postcss">
    * > :global(.userCard--avatar) {
        @apply w-10 h-10;
    }

    * > :global(.userCard--details) {
        @apply w-full;
    }
</style>
