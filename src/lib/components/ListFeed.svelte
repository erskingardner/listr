<script lang="ts">
    import { hasPeople, userIdsForList } from '$lib/interfaces/lists';
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import NoteInterface from '$lib/interfaces/notes';
    import Note from '$lib/components/Note.svelte';
    import type { Observable } from 'dexie';

    export let list: App.List;
    let notesFetched = false;
    let notes: Observable<NDKEvent[]>;

    if (list && hasPeople(list) && !notesFetched) {
        notes = NoteInterface.getNotesForUsers(userIdsForList(list));
        notesFetched = true;
    }
</script>

<div class="flex flex-col gap-2">
    {#if $notes === undefined || $notes.length === 0}
        <h2 class="animate-pulse">Loading notes...</h2>
    {:else}
        {#each $notes as note}
            <div
                class="flex flex-row items-center justify-between py-2 px-3 rounded-md
            border border-solid border-stone-800/20 dark:border-stone-100/20 listItemWrapper"
            >
                <Note {note} {list} saved={true} isFeed={true} />
            </div>
        {/each}
    {/if}
</div>
