<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import { onMount, onDestroy } from "svelte";
    import { filterAndSortByTitle } from "$lib/utils";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
    import { type NDKEvent, NDKList, NDKKind } from "@nostr-dev-kit/ndk";
    import { SUPPORTED_LIST_KINDS } from "$lib/utils";
    import ListCard from "$lib/components/lists/ListCard.svelte";
    import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
    import { Home } from "lucide-svelte";
    import { page } from "$app/stores";
    import { getUserAndProfile } from "$lib/utils/nostr";
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";

    let lists: NDKEventStore<ExtendedBaseType<NDKList>>;
    let deletedEvents: NDKEventStore<ExtendedBaseType<NDKEvent>>;
    let user: NDKUser;
    let profile: NDKUserProfile | null;
    let displayableName: string;

    $: {
        let userId = $page.params.userId;
        if (userId && user?.npub !== userId) {
            getUserAndProfile(userId).then(({ user: tmpUser, profile: tmpProfile }) => {
                user = tmpUser;
                profile = tmpProfile;

                // Unsubscribe from old lists and deleted events
                if (lists || deletedEvents) {
                    lists?.unsubscribe();
                    deletedEvents?.unsubscribe();
                }

                // Subscribe to new lists and deleted events
                lists = $ndk.storeSubscribe(
                    {
                        kinds: SUPPORTED_LIST_KINDS,
                        authors: [user.pubkey],
                    },
                    { closeOnEose: false },
                    NDKList
                );

                deletedEvents = $ndk.storeSubscribe({
                    kinds: [NDKKind.EventDeletion],
                    authors: [user.pubkey],
                });
            });
        }
    }

    $: displayableName =
        profile?.displayName ||
        profile?.name ||
        profile?.nip05 ||
        `${user?.npub.slice(0, 9)}...` ||
        "";

    // onMount(async () => {
    //     let { user: tmpUser, profile: tmpProfile } = await getUserAndProfile($page.params.userId);
    //     user = tmpUser;
    //     profile = tmpProfile;

    //     lists = $ndk.storeSubscribe(
    //         {
    //             kinds: SUPPORTED_LIST_KINDS,
    //             authors: [user.pubkey],
    //         },
    //         { closeOnEose: false },
    //         NDKList
    //     );

    //     deletedEvents = $ndk.storeSubscribe({
    //         kinds: [NDKKind.EventDeletion],
    //         authors: [user.pubkey],
    //     });
    // });

    onDestroy(() => {
        lists?.unsubscribe();
        deletedEvents?.unsubscribe();
    });

    $: {
        if ($lists) {
            $lists = filterAndSortByTitle($lists, $deletedEvents);
        }
    }
</script>

<svelte:head>
    {#if profile}
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
        <meta
            property="og:image"
            content={profile?.image || "https://beta.listr.lol/images/open-graph.webp"}
        />

        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="beta.listr.lol" />
        <meta property="twitter:url" content="https://beta.listr.lol/{user.npub}" />
        <meta name="twitter:title" content="Listr" />
        <meta
            name="twitter:description"
            content="Listr is the best way to curate, organize, and discover everything that Nostr has to offer. Build new lists, stay organized, and browse collections."
        />
        <meta
            name="twitter:image"
            content={profile?.image || "https://beta.listr.lol/images/open-graph.webp"}
        />
    {/if}
</svelte:head>

<Breadcrumb
    aria-label="User list breadcrumb"
    navClass="flex flex-row gap-2 w-full my-6"
    classOl="flex flex-row gap-2 items-center w-full"
>
    <BreadcrumbItem
        href="/feed"
        homeClass="flex flex-row gap-1.5 items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white "
        home
    >
        <svelte:fragment slot="icon">
            <Home strokeWidth="1.5" size="16" />
        </svelte:fragment>
        Activity Feed
    </BreadcrumbItem>
    <BreadcrumbItem class="flex flex-row gap-1.5 items-center">
        {displayableName}
    </BreadcrumbItem>
</Breadcrumb>

{#if $lists}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each $lists as list (list.id)}
            <ListCard npub={user.npub} {list} />
        {/each}
    </div>
{/if}
