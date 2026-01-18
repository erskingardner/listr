<script lang="ts">
import type { NDKTag } from "@nostr-dev-kit/ndk";
import { Loader2 } from "lucide-svelte";
import type { Snippet } from "svelte";

const PAGE_SIZE = 50;

let {
    items,
    renderItem,
}: {
    items: NDKTag[];
    renderItem: Snippet<[NDKTag, number]>;
} = $props();

let displayCount = $state(PAGE_SIZE);
let loadMoreTrigger: HTMLDivElement | null = $state(null);
let isLoadingMore = $state(false);

let visibleItems = $derived(items.slice(0, displayCount));
let hasMore = $derived(displayCount < items.length);
let totalCount = $derived(items.length);
let showingCount = $derived(Math.min(displayCount, items.length));

// Reset display count when items change significantly (e.g., navigating to a different list)
$effect(() => {
    // Access items.length to create a dependency
    const _ = items.length;
    displayCount = PAGE_SIZE;
});

$effect(() => {
    if (!loadMoreTrigger || !hasMore) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                loadMore();
            }
        },
        {
            rootMargin: "200px", // Start loading before the element is visible
        }
    );

    observer.observe(loadMoreTrigger);

    return () => {
        observer.disconnect();
    };
});

function loadMore() {
    if (isLoadingMore || !hasMore) return;

    isLoadingMore = true;
    // Use a small timeout to allow UI to update with loading state
    setTimeout(() => {
        displayCount = Math.min(displayCount + PAGE_SIZE, items.length);
        isLoadingMore = false;
    }, 50);
}
</script>

{#each visibleItems as item, index (item[1])}
    {@render renderItem(item, index)}
{/each}

{#if hasMore}
    <div
        bind:this={loadMoreTrigger}
        class="flex flex-col items-center justify-center py-4 gap-2"
    >
        {#if isLoadingMore}
            <Loader2 class="w-5 h-5 animate-spin text-gray-500" />
        {/if}
        <span class="text-sm text-gray-500 dark:text-gray-400">
            Showing {showingCount} of {totalCount} items
        </span>
    </div>
{:else if totalCount > PAGE_SIZE}
    <div class="flex items-center justify-center py-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">
            All {totalCount} items loaded
        </span>
    </div>
{/if}
