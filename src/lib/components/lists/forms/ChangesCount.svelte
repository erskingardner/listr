<script lang="ts">
import type { NDKTag } from "@nostr-dev-kit/ndk";

let {
    additions,
    removals,
    titleChanged,
    descriptionChanged,
    imageChanged = false,
}: {
    additions: NDKTag[];
    removals: NDKTag[];
    titleChanged: boolean;
    descriptionChanged: boolean;
    imageChanged?: boolean;
} = $props();
</script>

<div class="text-sm">
    {#if titleChanged}
        Name updated
    {/if}

    {#if (titleChanged) && (descriptionChanged || imageChanged)}
        /
    {/if}

    {#if descriptionChanged}
        Description updated
    {/if}

    {#if (titleChanged || descriptionChanged) && imageChanged}
        /
    {/if}

    {#if imageChanged}
        Image updated
    {/if}

    {#if (titleChanged || descriptionChanged || imageChanged) && (additions.length > 0 || removals.length > 0)}
        /
    {/if}

    {#if additions.length > 0}
        {additions.length}
        {additions.length === 1 ? "addition" : "additions"}
    {/if}

    {#if additions.length > 0 && removals.length > 0}
        /
    {/if}

    {#if removals.length > 0}
        {removals.length}
        {removals.length === 1 ? "removal" : "removals"}
    {/if}
</div>
