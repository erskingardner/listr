<script lang="ts">
    import type { PageData } from './$types';
    import PersonCard from '$lib/components/PersonCard.svelte';
    import type { NDKEvent, NDKZapInvoice } from '@nostr-dev-kit/ndk';
    import { zapInvoiceFromEvent } from '@nostr-dev-kit/ndk';
    import ndk from '$lib/stores/ndk';
    import List from '$lib/classes/list';

    export let data: PageData;

    // Subscribe to fetch all zap invoices for lists.
    // At the moment this doesn't happen often enough to return much data.
    // I need to figure out a way to get the historical data.
    const zapsSub = $ndk.subscribe({ kinds: [9735] }, { closeOnEose: false });

    zapsSub.on('event', (event: NDKEvent) => {
        // Bail out if we don't have an "a" tag
        const listTag = event.getMatchingTags('a')[0];
        if (!listTag) return;
        // or the "a" tag doesn't match a supported list kind
        const listKind = listTag[1].match(/(\d{1,5}):/);
        if (
            !listKind ||
            !List.supportedKinds.includes(parseInt(listKind[1].substring(0, listKind?.length - 1)))
        )
            return;

        // Parse the zap invoice
        const zapInvoice = zapInvoiceFromEvent(event);
        if (zapInvoice) {
            // console.log(zapInvoice);
        }
    });
</script>

<svelte:head>
    <title>Listr</title>
    <meta
        name="description"
        content="A Nostr based app to help you view and manage your own
        Nostr lists and find great content in other people's lists."
    />
</svelte:head>

<div class="prose-zinc prose-lg dark:prose-invert mx-auto mb-10">
    <p class="">Listr is a simple tool that allows you to browse and manage Nostr lists.</p>
    <h2 class="text-xl md:text-2xl mb-4 font-bold tracking-tight">
        Check out a few examples, then sign in to view your own!
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#key data.ids}
            {#each data.ids as id}
                <PersonCard {id} />
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
