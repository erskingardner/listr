<script lang="ts">
import type { NDKTag } from "@nostr-dev-kit/ndk";
import { Loader2 } from "lucide-svelte";
import type { Snippet } from "svelte";

const PAGE_SIZE = 50;
const MAX_VISIBLE_ITEMS = 150;
const ITEM_HEIGHT_ESTIMATE = 80;

let {
    items,
    renderItem,
}: {
    items: NDKTag[];
    renderItem: Snippet<[NDKTag, number]>;
} = $props();

let endIndex = $state(PAGE_SIZE);
let startIndex = $state(0);
let loadMoreTrigger: HTMLDivElement | null = $state(null);
let loadPrevTrigger: HTMLDivElement | null = $state(null);
let isLoadingMore = $state(false);
let isLoadingPrev = $state(false);

let visibleItems = $derived(items.slice(startIndex, endIndex));
let hasMore = $derived(endIndex < items.length);
let hasPrev = $derived(startIndex > 0);
let totalCount = $derived(items.length);
let showingCount = $derived(Math.min(endIndex, items.length) - startIndex);
let topSpacerHeight = $derived(startIndex * ITEM_HEIGHT_ESTIMATE);

// Reset display count when items change significantly (e.g., navigating to a different list)
$effect(() => {
    // Access items.length to create a dependency
    const _ = items.length;
    endIndex = PAGE_SIZE;
    startIndex = 0;
});

$effect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (
                    entry.target === loadMoreTrigger &&
                    entry.isIntersecting &&
                    hasMore &&
                    !isLoadingMore
                ) {
                    loadMore();
                }
                if (
                    entry.target === loadPrevTrigger &&
                    entry.isIntersecting &&
                    hasPrev &&
                    !isLoadingPrev
                ) {
                    loadPrev();
                }
            }
        },
        {
            rootMargin: "400px", // Start loading before the element is visible
        }
    );

    if (loadMoreTrigger) observer.observe(loadMoreTrigger);
    if (loadPrevTrigger) observer.observe(loadPrevTrigger);

    return () => {
        observer.disconnect();
    };
});

function loadMore() {
    if (isLoadingMore || !hasMore) return;

    isLoadingMore = true;
    // Use a small timeout to allow UI to update with loading state
    setTimeout(() => {
        endIndex = Math.min(endIndex + PAGE_SIZE, items.length);
        // Windowing: Remove items from top if we exceed max visible
        if (endIndex - startIndex > MAX_VISIBLE_ITEMS) {
            startIndex = endIndex - MAX_VISIBLE_ITEMS;
        }
        isLoadingMore = false;
    }, 50);
}

function loadPrev() {
    if (isLoadingPrev || !hasPrev) return;

    isLoadingPrev = true;
    setTimeout(() => {
        startIndex = Math.max(0, startIndex - PAGE_SIZE);
        // Windowing: Remove items from bottom if we exceed max visible
        if (endIndex - startIndex > MAX_VISIBLE_ITEMS) {
            endIndex = startIndex + MAX_VISIBLE_ITEMS;
        }
        isLoadingPrev = false;
    }, 50);
}
</script>

{#if hasPrev}
    <div style="height: {topSpacerHeight}px; width: 100%;"></div>
    <div bind:this={loadPrevTrigger} style="height: 1px; width: 100%;"></div>
{/if}

{#each visibleItems as item, index (item[1])}
    {@render renderItem(item, startIndex + index)}
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
