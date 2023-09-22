<script lang="ts">
    import type { NDKTag } from "@nostr-dev-kit/ndk";

    export let additions: Array<NDKTag>;
    export let removals: Array<NDKTag>;
    export let nameChanged: boolean;
    export let descriptionChanged: boolean;
</script>

<div class="text-sm">
    {#if nameChanged}
        Name updated
    {/if}

    {#if nameChanged && descriptionChanged}
        /
    {/if}

    {#if descriptionChanged}
        Description updated
    {/if}

    {#if (nameChanged || descriptionChanged) && (additions.length > 0 || removals.length > 0)}
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
