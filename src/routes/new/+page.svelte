<script lang="ts">
    import CheckIcon from '$lib/elements/icons/Check.svelte';
    import HashIcon from '$lib/elements/icons/Hash.svelte';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import ListItem from '$lib/components/ListItem.svelte';
    import ListItemForm from '$lib/components/ListItemForm.svelte';
    import { Tooltip } from 'flowbite-svelte';
    import { NDKEvent, NDKNip07Signer } from '@nostr-dev-kit/ndk';
    import type { NDKTag } from '@nostr-dev-kit/ndk/lib/src/events';
    import { unixTimeNow } from '$lib/utils/helpers';
    import { currentUser } from '$lib/stores/currentUser';
    import ndk from '$lib/stores/ndk';
    import { db } from '$lib/interfaces/db';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import List from '$lib/classes/list';

    let list: List;
    let listName: string;
    let listKind: string;
    let warningMessage: string = '';
    let errorMessage: string = '';
    let nameSet: boolean = false;
    let unsavedListItems: NDKTag[] = [];

    function buildListObject() {
        list = new List({
            kind: parseInt(listKind),
            name: listName,
            content: '',
            authorPubkey: $currentUser?.pubkey as string,
            publicItems: unsavedListItems,
            privateItems: [],
            expanded: true
        });
    }
    function validateKind() {
        if (listKind === '10000') {
            listName = 'mute';
            warningMessage =
                '⚠️ Creating a new "mute" list will overwrite your current "mute" list.';
            errorMessage = '';
        } else if (listKind === '10001') {
            listName = 'pin';
            warningMessage = '⚠️ Creating a new "pin" list will overwrite your current "pin" list.';
            errorMessage = '';
        } else if (listKind === '30000' || listKind === '30001') {
            let nameInput = document.getElementById('listName') as HTMLInputElement;
            listName = '';
            nameInput.placeholder = 'Give your new list a name...';
            nameInput.disabled = false;
            warningMessage = '';
            errorMessage = '';
        } else {
            errorMessage = 'Please choose a list kind.';
        }
        buildListObject();
    }

    function validateName() {
        if (!listName || listName.length === 0) {
            errorMessage = 'Name is required.';
        } else if (listName.match('<script>')) {
            errorMessage = 'Keep your scripts to yourself please.';
        } else {
            errorMessage = '';
        }
        buildListObject();
    }

    function validateAndSubmit() {
        if (listKind && listName && errorMessage === '') {
            nameSet = true;
        } else {
            validateKind();
            validateName();
        }
    }

    function addUnsavedItem(event: any) {
        let itemTag: NDKTag = List.tagFromNip19String(event.detail.addr);
        unsavedListItems.push(itemTag);
        unsavedListItems = unsavedListItems;
    }

    function publishListEvent() {
        if (browser && $currentUser) {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
        }
        if (list && unsavedListItems.length) {
            let tagsForList: NDKTag[] = unsavedListItems;
            // Only add a "d" tag if needed
            if (list.kind === 30000 || list.kind === 30001) {
                tagsForList.push(['d', list.name as string]);
            }

            // Build new list event
            let listToPublish = new NDKEvent($ndk, {
                content: list.content as string,
                kind: list.kind,
                pubkey: list.authorPubkey as string,
                created_at: unixTimeNow(),
                tags: tagsForList
            });

            // Sign and publish new list event
            try {
                listToPublish.publish().then(() => {
                    unsavedListItems = [];
                    List.create({ event: listToPublish }).then(async (pk) => {
                        let newList = await db.lists.get(pk);
                        goto(`/a/${newList?.nip19}`);
                    });
                });
            } catch (error) {
                console.log('Error publishing: ', error);
            }
        }
    }
</script>

<h2 class="text-xl md:text mb-4 font-bold tracking-tight">Create a new list</h2>

<div class="listWrapper">
    {#if nameSet}
        <div class="flex flex-row gap-4 mb-6 items-center justify-between">
            <div class="flex flex-row gap-4 items-center">
                <h2 class="flex flex-row gap-1 items-center text-2xl font-semibold">
                    <HashIcon />
                    {listName}
                </h2>
                <InfoIcon />
                <Tooltip
                    style="custom"
                    class="dark:bg-zinc-800 bg-zinc-100  border border-black/20 shadow-xl"
                >
                    Kind: {listKind}
                </Tooltip>
            </div>
            <div class="flex flex-row gap-4 items-center">
                {#if unsavedListItems.length}
                    <span class="text-orange-500 dark:text-orange-300/60">
                        {unsavedListItems.length}
                        {unsavedListItems.length === 1 ? 'change' : 'changes'} to be published
                        <button
                            class="px-2 py-1 rounded-md bg-transparent border
                        border-orange-500 dark:border-orange-300/80
                        text-orange-500 dark:text-orange-300/80 ml-2
                        hover:bg-orange-500/20 dark:hover:bg-orange-300/20"
                            on:click={publishListEvent}
                        >
                            Publish Now
                        </button>
                    </span>
                {/if}
            </div>
        </div>
        <div class="mb-2">
            <div
                class="flex flex-row gap-4 rounded-md p-4 justify-center
                border border-zinc-800/20 dark:border-zinc-100/20"
            >
                <ListItemForm on:addItemToList={addUnsavedItem} {list} />
            </div>
        </div>
        <div id="unsavedListItems" class="flex flex-col gap-2 mb-2">
            {#each unsavedListItems as listItem}
                <ListItem item={listItem} saved={false} {list} />
            {/each}
        </div>
    {:else}
        <div class="flex flex-col gap-2 w-full relative">
            <div class="flex flex-col md:flex-row gap-4 items-center justify-start">
                <select
                    name="listKind"
                    id="listKind"
                    class="border rounded-md bg-transparent w-full md:w-1/2 grow"
                    bind:value={listKind}
                    on:change={validateKind}
                >
                    <option value="">What kind of list?</option>
                    <option value="10000">Mute list: Kind 10000</option>
                    <option value="10001">Pin list: Kind 10001</option>
                    <option value="30000">People list: Kind 30000</option>
                    <option value="30001">Bookmarks list: Kind 30001</option>
                </select>
                <div class="w-full md:w-1/2 grow relative">
                    <input
                        type="text"
                        name="listName"
                        id="listName"
                        disabled
                        class="border rounded-md bg-transparent w-full"
                        placeholder="First, choose a kind..."
                        bind:value={listName}
                        on:blur={validateName}
                    />
                    <div class="absolute top-1/2 -translate-y-1/2 right-2"><InfoIcon /></div>
                    <Tooltip
                        style="custom"
                        class="dark:bg-zinc-800 bg-zinc-100  border border-black/20 shadow-xl"
                    >
                        Custom names only supported on kind 30000 & 30001 lists
                    </Tooltip>
                </div>
                <button
                    on:click={validateAndSubmit}
                    disabled={!!errorMessage.length}
                    class="w-full md:w-auto flex flex-row justify-center items-center relative border rounded-md p-2 border-green-500
            hover:text-green-500 disabled:text-zinc-600 disabled:border-zinc-600"
                >
                    <CheckIcon />
                </button>
            </div>
            {#if warningMessage}
                <div class="warnings text-orange-500 dark:text-orange-400 ml-4">
                    {warningMessage}
                </div>
            {/if}
            {#if errorMessage}
                <div class="errors text-red-500 dark:text-red-500 ml-4">{errorMessage}</div>
            {/if}
        </div>
    {/if}
</div>
