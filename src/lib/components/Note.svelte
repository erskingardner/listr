<script lang="ts">
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import ndk from '$lib/stores/ndk';

    export let noteId: string;
    export let klass: string = '';

    let note: NDKEvent;
    $ndk.fetchEvent({ ids: [noteId] }).then(async (event) => {
        note = event;
    });

    const classes = klass + ' break-words';
</script>

<div class={classes}>
    {#if note}
        {#if note.content.length > 0}
            {note.content}
        {:else}
            {noteId}
        {/if}
    {:else}
        Event not found
    {/if}
</div>
