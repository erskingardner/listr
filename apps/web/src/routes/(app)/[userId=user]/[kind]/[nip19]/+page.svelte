<script lang="ts">
    import Item from "$lib/components/lists/Item.svelte";
    import { Info } from "lucide-svelte";
    import ListActions from "$lib/components/lists/actions/ListActions.svelte";
    import { Tooltip } from "flowbite-svelte";
    import AddItemForm from "$lib/components/lists/forms/AddItemForm.svelte";
    import type { NDKTag } from "@nostr-dev-kit/ndk";
    import { slide } from "svelte/transition";
    import { expoInOut } from "svelte/easing";
    import { afterNavigate, beforeNavigate } from "$app/navigation";

    export let data;

    let privateItems: NDKTag[] | undefined = data.privateItems;
    let publicItems: NDKTag[] = data.items;
    let unsavedPublicItems: NDKTag[] = [];
    let unsavedPrivateItems: NDKTag[] = [];
    let unsavedPublicRemovals: NDKTag[] = [];
    let unsavedPrivateRemovals: NDKTag[] = [];

    let editFormVisible: boolean = false;
    let unpublishedChanges: boolean = false;

    $: unpublishedChanges =
        unsavedPrivateItems.length > 0 ||
        unsavedPrivateRemovals.length > 0 ||
        unsavedPublicItems.length > 0 ||
        unsavedPublicRemovals.length > 0;

    beforeNavigate(() => {
        if (unpublishedChanges) {
            confirm("You have unpublished changes. Are you sure you want to leave the page?");
        }
    });

    afterNavigate(() => {
        privateItems = data.privateItems;
        publicItems = data.items;
        unsavedPublicItems = [];
        unsavedPrivateItems = [];
        unsavedPublicRemovals = [];
        unsavedPrivateRemovals = [];
    });

    function toggleEditForm() {
        editFormVisible = !editFormVisible;
    }

    function handleListAddition(event: any) {
        if (event.detail.type === "public") {
            unsavedPublicItems.push(event.detail.tag);
            unsavedPublicItems = unsavedPublicItems;
        } else if (event.detail.type === "private") {
            unsavedPrivateItems.push(event.detail.tag);
            unsavedPrivateItems = unsavedPrivateItems;
        }
    }

    function handleListRemoval(event: any) {
        const removedTag = [event.detail.type, event.detail.id];
        console.log(event.detail);

        if (event.detail.unsaved) {
            if (event.detail.privateItem) {
                // Remove the unpublished item from the list of things to be published
                unsavedPrivateItems = unsavedPrivateItems.filter((tag) => tag !== removedTag);
            } else {
                // Remove the unpublished item from the list of things to be published
                unsavedPublicItems = unsavedPublicItems.filter((tag) => tag !== removedTag);
            }
        } else {
            if (event.detail.privateItem) {
                unsavedPrivateRemovals.push(removedTag);
                unsavedPrivateRemovals = unsavedPrivateRemovals;
                privateItems = privateItems?.filter((tag) => tag !== removedTag);
            } else {
                unsavedPublicRemovals.push(removedTag);
                unsavedPublicRemovals = unsavedPublicRemovals;
                // filtering arrays not working like this.
                publicItems = publicItems.filter((tag) => tag !== removedTag);
                console.log(publicItems);
            }
            // TODO: remember to remove these for both public and private items before publishing
        }
    }
</script>

<div class="flex flex-row items-center justify-between">
    <div class="text-lg font-bold flex flex-row items-center gap-2">
        {data.name}
        <Info strokeWidth="1.5" size="20" />
        <Tooltip type="light">Kind: {data.kind}</Tooltip>
        <span class="text-sm font-normal">{data.itemCount} items</span>
    </div>
    <ListActions
        nip19={data.nip19}
        pubkey={data.pubkey}
        listId={data.listId}
        rawList={data.rawList}
        on:listDeleted
        on:toggleEditForm={toggleEditForm}
    />
</div>
<hr />
<div class="flex flex-col">
    {#if editFormVisible}
        <div transition:slide={{ easing: expoInOut }}>
            <AddItemForm on:addListItem={handleListAddition} />
        </div>
    {/if}

    {#if unpublishedChanges}
        <fieldset class="border border-orange-300 rounded-md p-2">
            <legend class="text-orange-500">Unpublished changes</legend>
            {#each unsavedPrivateItems as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    privateItem={true}
                    unsaved={true}
                    on:removeItem={handleListRemoval}
                />
            {/each}
            {#each unsavedPublicItems as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    privateItem={false}
                    unsaved={true}
                    on:removeItem={handleListRemoval}
                />
            {/each}
            {#each unsavedPrivateRemovals as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    privateItem={true}
                    unsaved={true}
                    removal={true}
                    on:removeItem={handleListRemoval}
                />
            {/each}
            {#each unsavedPublicRemovals as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    privateItem={false}
                    unsaved={true}
                    removal={true}
                    on:removeItem={handleListRemoval}
                />
            {/each}
        </fieldset>
    {/if}

    {#each privateItems || [] as item (item[1])}
        <Item
            id={item[1]}
            tag={item}
            privateItem={true}
            unsaved={false}
            on:removeItem={handleListRemoval}
        />
    {/each}
    {#each publicItems || [] as item (item[1])}
        <Item
            id={item[1]}
            tag={item}
            privateItem={false}
            unsaved={false}
            on:removeItem={handleListRemoval}
        />
    {/each}
</div>
