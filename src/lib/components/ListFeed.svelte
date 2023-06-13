<script lang="ts">
    import NoteComponent from '$lib/components/listItems/Note.svelte';
    import type { Observable } from 'dexie';
    import type List from '$lib/classes/list';
    import { currentUser } from '$lib/stores/currentUser';
    import Note from '$lib/classes/note';

    export let list: List;
    let notesFetched = false;
    let notes: Observable<Note[]>;

    if (list && list.hasPeople($currentUser?.pubkey === list.authorPubkey) && !notesFetched) {
        notes = Note.getNotesForUsers(
            list.userIdsForList($currentUser?.pubkey === list.authorPubkey)
        );
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
            border border-solid border-zinc-800/20 dark:border-zinc-100/20 listItemWrapper"
            >
                <NoteComponent {note} {list} saved={true} isFeed={true} />
            </div>
        {/each}
    {/if}
</div>
