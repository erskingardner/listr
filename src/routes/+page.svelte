<script lang="ts">
    import type { PageData } from './$types';
    import PersonCard from '$lib/components/PersonCard.svelte';

    export let data: PageData;
</script>

<svelte:head>
    <title>Listr</title>
    <meta
        name="description"
        content="A Nostr based app to help you view and manage your own
        Nostr lists and find great content in other people's lists."
    />
</svelte:head>

<div class="prose-stone prose-lg dark:prose-invert mx-auto mb-10">
    <p class="">Listr is a simple tool that allows you to browse and manage Nostr lists.</p>
    <h2 class="text-xl md:text-3xl mb-4 font-bold tracking-tight">
        Check out a few examples, then sign in to view your own!
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#key data.npubs}
            {#each data.npubs as personNpub}
                <PersonCard npub={personNpub} />
            {/each}
        {/key}
    </div>
    <h2 class="text-xl md:text mb-4 font-bold tracking-tight">What are lists?</h2>
    <p>
        Lists in Nostr are defined in <a
            href="https://github.com/nostr-protocol/nips/blob/master/51.md"
            target="_blank">NIP-51</a
        >. There are several different types of lists. All types of lists are replaceable, meaning
        that only the most recent event (version of your list) matters.
    </p>
    <ul class="list-disc list-inside">
        <li>
            <strong>Mute list:</strong> <code>(kind: 10000)</code> This is for muted users and conversations.
        </li>
        <li>
            <strong>Pin list:</strong> <code>(kind: 10001)</code> This is for pinned conversations.
        </li>
        <li>
            <strong>Categorized People list:</strong> <code>(kind: 30000)</code> This is a list of users
            with a title. Hence, you can store any type of people list you'd like.
        </li>
        <li>
            <strong>Categorized Bookmark list:</strong> <code>(kind: 30001)</code> This is a list of
            notes with a title. Hence, you can store any arbitrary list of notes you'd like.
        </li>
    </ul>
    <p>
        All lists have a mechanism to store values in a public or private way. More on this in the
        future...
    </p>
</div>
