<script lang="ts">
import type { NDKEvent, NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
import { Home } from "lucide-svelte";
import { page } from "$app/stores";
import FollowPackCard from "$lib/components/lists/FollowPackCard.svelte";
import ListCard from "$lib/components/lists/ListCard.svelte";
import ndk from "$lib/stores/ndk.svelte";
import { filterAndSortByTitle, SUPPORTED_LIST_KINDS } from "$lib/utils";

let userId = $derived($page.params.userId);
let user: NDKUser = $derived(ndk.getUser({ npub: userId }));
let profile: NDKUserProfile | null = $state(null);
let displayableName: string = $state("");

// Subscribe to user's lists
let listsSub = ndk.$subscribe(() =>
    user
        ? {
              filters: [
                  {
                      kinds: SUPPORTED_LIST_KINDS,
                      authors: [user.pubkey],
                  },
              ],
          }
        : undefined
);

// Subscribe to deleted events
let deletedEventsSub = ndk.$subscribe(() =>
    user
        ? {
              filters: [
                  {
                      kinds: [NDKKind.EventDeletion],
                      authors: [user.pubkey],
                  },
              ],
          }
        : undefined
);

let lists = $derived(listsSub.events.map((e: NDKEvent) => NDKList.from(e)));
let deletedEvents = $derived(deletedEventsSub.events);
let filteredLists: NDKList[] = $derived(filterAndSortByTitle(lists, deletedEvents));

let starterPacks = $derived(filteredLists.filter((l) => l.kind === 39089));
let otherLists = $derived(filteredLists.filter((l) => l.kind !== 39089));

$effect(() => {
    if (user && !profile) {
        user.fetchProfile().then((fetchedProfile) => {
            profile = fetchedProfile;
            displayableName =
                profile?.displayName ||
                profile?.name ||
                profile?.nip05 ||
                `${user?.npub.slice(0, 9)}...` ||
                "";
        });
    }
});
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

{#snippet homeIcon()}
    <Home strokeWidth="1.5" size="16" />
{/snippet}

<Breadcrumb
    aria-label="User list breadcrumb"
    class="flex flex-row gap-2 w-full my-6"
    classes={{ list: "flex flex-row gap-2 items-center w-full" }}
>
    <BreadcrumbItem
        href="/feed"
        homeClass="flex flex-row gap-1.5 items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white "
        home
        icon={homeIcon}
    >
        Activity Feed
    </BreadcrumbItem>
    <BreadcrumbItem class="flex flex-row gap-1.5 items-center">
        {displayableName}
    </BreadcrumbItem>
</Breadcrumb>

{#if lists.length > 0}
    {#if starterPacks.length > 0}
        <div class="mb-8 flex flex-col gap-4">
            <h2 class="text-xl font-bold">Starter Packs</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each starterPacks as list (list.id)}
                    <FollowPackCard {list} />
                {/each}
            </div>
        </div>
    {/if}

    {#if otherLists.length > 0}
        {#if starterPacks.length > 0}
            <h2 class="text-xl font-bold mb-4">Other Lists</h2>
        {/if}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each otherLists as list (list.id)}
                <ListCard npub={user.npub} {list} />
            {/each}
        </div>
    {/if}
{/if}
