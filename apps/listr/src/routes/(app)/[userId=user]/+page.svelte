<script lang="ts">
    import type { PageData } from "./$types";
    import ndk from "$lib/stores/ndk";
    import { onMount, onDestroy } from "svelte";
    import { filterAndSortByName } from "$lib/utils";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
    import { type NDKEvent, NDKList, NDKKind, type NDKUserProfile } from "@nostr-dev-kit/ndk";
    import { SUPPORTED_LIST_KINDS } from "$lib/utils";
    import ListCard from "$lib/components/lists/ListCard.svelte";
    import { afterNavigate } from "$app/navigation";

    export let data: PageData;
    const user = $ndk.getUser({ hexpubkey: data.pubkey });
    let userProfile: NDKUserProfile | null;
    let displayableName: string;

    let lists: NDKEventStore<ExtendedBaseType<NDKList>>;
    let deletedEvents: NDKEventStore<ExtendedBaseType<NDKEvent>>;

    onMount(async () => {
        lists = $ndk.storeSubscribe(
            {
                kinds: SUPPORTED_LIST_KINDS,
                authors: [data.pubkey],
            },
            { closeOnEose: false },
            NDKList
        );

        deletedEvents = $ndk.storeSubscribe({
            kinds: [NDKKind.EventDeletion],
            authors: [data.pubkey],
        });
    });

    afterNavigate(async () => {
        console.log("navigate", user);
        userProfile = await user.fetchProfile();
    });

    onDestroy(() => {
        lists?.unsubscribe();
        deletedEvents?.unsubscribe();
    });

    $: if ($lists) {
        $lists = filterAndSortByName($lists, $deletedEvents);
    }

    $: displayableName = displayableName =
        userProfile?.displayName ||
        userProfile?.name ||
        userProfile?.nip05 ||
        `${user.npub.slice(0, 9)}...`;
</script>

<svelte:head>
    {#await user.fetchProfile() then profile}
        <title>{`${displayableName} - Listr`}</title>
        <meta
            name="description"
            content={`Listr user page showing all lists for ${displayableName}`}
        />

        <!-- Facebook Meta Tags -->
        <meta property="og:url" content="https://beta.listr.lol/{user.npub}" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Listr" />
        <meta
            property="og:description"
            content="Listr is the best way to curate, organize, and discover everything that Nostr has to offer. Build new lists, stay organized, and browse collections."
        />
        <meta property="og:image" content={profile?.image || "/images/open-graph.webp"} />

        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="beta.listr.lol" />
        <meta property="twitter:url" content="https://beta.listr.lol/{user.npub}" />
        <meta name="twitter:title" content="Listr" />
        <meta
            name="twitter:description"
            content="Listr is the best way to curate, organize, and discover everything that Nostr has to offer. Build new lists, stay organized, and browse collections."
        />
        <meta name="twitter:image" content={profile?.image || "/images/open-graph.webp"} />
    {/await}
</svelte:head>

{#if $lists}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each $lists as list}
            {#key list.id}
                <ListCard npub={user.npub} {list} />
            {/key}
        {/each}
    </div>
{/if}
