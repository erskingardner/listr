<script lang="ts">
    import { Avatar, Tooltip } from 'flowbite-svelte';
    import LinkOutIcon from '$lib/elements/icons/LinkOut.svelte';
    import XMarkIcon from '$lib/elements/icons/XMark.svelte';
    import { nip19 } from 'nostr-tools';
    import type { Observable } from 'dexie';
    import SharePopover from './SharePopover.svelte';
    import { currentUser } from '$lib/stores/currentUser';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import NoteComponent from '$lib/components/listItems/Note.svelte';
    import Emoji from '$lib/components/listItems/Emoji.svelte';
    import type List from '$lib/classes/list';
    import User from '$lib/classes/user';
    import Note from '$lib/classes/note';
    import { currentUserFollows } from '$lib/stores/currentUserFollows';
    import { NDKEvent, NDKNip07Signer, type NDKTag } from '@nostr-dev-kit/ndk';
    import ndk from '$lib/stores/ndk';
    import { unixTimeNow } from '$lib/utils/helpers';

    const dispatch = createEventDispatcher();

    export let item: string[];
    export let saved: boolean;
    export let action: string | undefined = undefined;
    export let list: List;

    let itemType: string;
    let itemId: string = item[1];
    let encodedNoteId: string = '';
    let person: Observable<User>;
    let note: Observable<Note>;

    if (item[0] === 'e') {
        itemType = 'Event';
        try {
            encodedNoteId = nip19.noteEncode(itemId);
        } catch (error) {
            console.log('Error encoding note ID: ', error);
        }
        note = Note.get(itemId);
    }

    if (item[0] === 'p') {
        itemType = 'Person';
        person = User.get(itemId);
    }

    if (item[0] === 'emoji') {
        itemType = 'Emoji';
    }

    function encodedId(hexId: string): string {
        let encoded: string = '';
        if (item[0] === 'e') {
            try {
                encoded = nip19.noteEncode(itemId);
            } catch (error) {
                console.log('Error encoding note ID: ', error);
            }
        } else {
            try {
                encoded = nip19.npubEncode(itemId);
            } catch (error) {
                console.log('Error encoding npub: ', error);
            }
        }
        return encoded;
    }

    function submitRemove() {
        dispatch('removeItemFromList', { addr: encodedId(itemId), action: 'delete' });
    }

    function unfollow(pubkey: string | undefined) {
        if ($currentUser && $currentUserFollows) {
            const followerListMinusUnfollow = $currentUserFollows.filter(
                (hexPubkey) => hexPubkey !== pubkey
            );
            // build tags for all new follows list
            const tags: NDKTag[] = followerListMinusUnfollow?.map(
                (followerPubkey) => ['p', followerPubkey] as NDKTag
            );
            // build the event & publish
            let event = new NDKEvent($ndk, {
                pubkey: $currentUser.pubkey,
                kind: 3,
                tags: tags,
                content: '',
                created_at: unixTimeNow()
            });
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
            event.publish().then(() => {
                // update our store if the event publishes
                currentUserFollows.set(tags.map((tag) => tag[1]));
            });
        }
    }

    function follow(pubkey: string | undefined) {
        if ($currentUser && $currentUserFollows) {
            // build tags for all current follows
            const tags: NDKTag[] = $currentUserFollows?.map(
                (followerPubkey) => ['p', followerPubkey] as NDKTag
            );
            // add the new user to follow
            tags.push(['p', pubkey as string]);
            // build the event & publish
            let event = new NDKEvent($ndk, {
                pubkey: $currentUser.pubkey,
                kind: 3,
                tags: tags,
                content: '',
                created_at: unixTimeNow()
            });
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
            event.publish().then(() => {
                // update our store if the event publishes
                currentUserFollows.set(tags.map((tag) => tag[1]));
            });
        }
    }

    // This is a gross hack to get back a real User object, not a duck-typed pseudo-user.
    let realPerson: User;
    $: if ($person) realPerson = new User($person);

    // This is a gross hack to get back a real Note object, not a duck-typed pseudo-note.
    let realNote: Note;
    $: if ($note) realNote = new Note($note);
</script>

<div
    class="flex flex-row items-center justify-between
    py-2 px-3 rounded-md border listItemWrapper
    {saved ? 'border-solid border-zinc-800/20 dark:border-zinc-100/20' : 'border-dashed'}
    {action === 'added' ? 'border-green-500 dark:border-green-300/50' : ''}
    {action === 'deleted' ? 'border-orange-500 dark:border-orange-300/50' : ''}"
>
    {#if itemType === 'Person'}
        {#if realPerson}
            <div class="flex flex-row gap-4 items-center">
                <Avatar src={realPerson.image} class="object-cover border border-white/10" />
                <a href={`/${realPerson.npub}`}>{realPerson.displayableName()}</a>
            </div>
            <div class="flex flex-col md:flex-row gap-4 items-center listIconsWrapper opacity-20">
                {#if !saved}
                    <span
                        class="text-sm
                    {action === 'added' ? 'text-green-500 dark:text-green-300/50' : ''}
                    {action === 'deleted' ? 'text-orange-500 dark:text-orange-300/50' : ''}"
                        >Unpublished {action === 'added' ? 'addition' : 'removal'}</span
                    >
                {/if}
                {#if $currentUser}
                    {#if realPerson.pubkey && $currentUserFollows?.includes(realPerson.pubkey)}
                        <button class="outlineButton" on:click={() => unfollow(realPerson.pubkey)}>
                            Unfollow
                        </button>
                    {:else}
                        <button class="outlineButton" on:click={() => follow(realPerson.pubkey)}>
                            Follow
                        </button>
                    {/if}
                {/if}
                <SharePopover type={itemType} id={itemId} />
                <a
                    href="https://primal.net/profile/{realPerson.npub}"
                    class="hover:text-zinc-700 hover:dark:text-zinc-400 border-0"
                    target="_blank"
                >
                    <LinkOutIcon />
                </a>
                {#if $currentUser?.pubkey === list.authorPubkey && saved && $page.url.pathname.startsWith('/a/')}
                    <button
                        on:click={submitRemove}
                        class="hover:text-zinc-700 hover:dark:text-zinc-400 border-0"
                    >
                        <XMarkIcon />
                        <Tooltip style="custom" class="dark:bg-zinc-800 bg-zinc-100 shadow-sm">
                            Remove this item from the list
                        </Tooltip>
                    </button>
                {/if}
            </div>
        {/if}
    {:else if itemType === 'Emoji'}
        <Emoji {item} on:removeItemFromList />
    {:else if $note === undefined}
        <h2 class="animate-pulse">Loading note...</h2>
    {:else if realNote}
        <NoteComponent note={realNote} {list} {saved} isFeed={false} on:removeItemFromList />
    {/if}
</div>
