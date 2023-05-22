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

{#if $notes === undefined || $notes.length === 0}
    <h2 class="animate-pulse">Loading notes...</h2>
{:else}
    {#each $notes as note}
        <Note {note} />
    {/each}
{/if}
