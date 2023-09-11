<script lang="ts">
    import Item from "$lib/components/lists/Item.svelte";
    import { HardDriveUpload, Info } from "lucide-svelte";
    import ListActions from "$lib/components/lists/actions/ListActions.svelte";
    import { Tooltip } from "flowbite-svelte";
    import AddItemForm from "$lib/components/lists/forms/AddItemForm.svelte";
    import { NDKList, NDKNip07Signer, type NDKTag } from "@nostr-dev-kit/ndk";
    import { slide } from "svelte/transition";
    import { expoInOut } from "svelte/easing";
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import currentUser from "$lib/stores/currentUser.js";
    import ChangesCount from "$lib/components/lists/forms/ChangesCount.svelte";
    import { unixTimeNowInSeconds } from "$lib/utils/dates.js";
    import ndk from "$lib/stores/ndk.js";
    import listsStore from "$lib/stores/allLists.js";

    export let data;
    console.log(data);
    let privateItems: NDKTag[] = data.privateItems || [];
    let publicItems: NDKTag[] = data.items;
    let unsavedPublicItems: NDKTag[] = [];
    let unsavedPrivateItems: NDKTag[] = [];
    let unsavedPublicRemovals: NDKTag[] = [];
    let unsavedPrivateRemovals: NDKTag[] = [];

    let unpublishedChanges: boolean = false;

    let publishingChanges: boolean = false;

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
        privateItems = data.privateItems || [];
        publicItems = data.items;
        unsavedPublicItems = [];
        unsavedPrivateItems = [];
        unsavedPublicRemovals = [];
        unsavedPrivateRemovals = [];
    });

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

        if (event.detail.privateItem) {
            unsavedPrivateRemovals.push(removedTag);
            unsavedPrivateRemovals = unsavedPrivateRemovals;
            privateItems = privateItems?.filter(
                (tag) => !(tag[0] === removedTag[0] && tag[1] === removedTag[1])
            );
        } else {
            unsavedPublicRemovals.push(removedTag);
            unsavedPublicRemovals = unsavedPublicRemovals;
            publicItems = publicItems.filter(
                (tag) => !(tag[0] === removedTag[0] && tag[1] === removedTag[1])
            );
        }
    }

    function handleRemoveUnsavedItem(event: any) {
        const replacedTag = [event.detail.type, event.detail.id];
        console.log(event.detail);

        if (event.detail.privateItem) {
            // Only put it back if it was a removal to start with
            if (event.detail.removal) {
                privateItems?.push(replacedTag);
                privateItems = privateItems;
                unsavedPrivateRemovals = unsavedPrivateRemovals.filter(
                    (tag) => !(tag[0] === replacedTag[0] && tag[1] === replacedTag[1])
                );
            } else {
                unsavedPrivateItems = unsavedPrivateItems.filter(
                    (tag) => !(tag[0] === replacedTag[0] && tag[1] === replacedTag[1])
                );
            }
        } else {
            // Only put it back if it was a removal to start with
            if (event.detail.removal) {
                publicItems.push(replacedTag);
                publicItems = publicItems;
                unsavedPublicRemovals = unsavedPublicRemovals.filter(
                    (tag) => !(tag[0] === replacedTag[0] && tag[1] === replacedTag[1])
                );
            } else {
                unsavedPublicItems = unsavedPublicItems.filter(
                    (tag) => !(tag[0] === replacedTag[0] && tag[1] === replacedTag[1])
                );
            }
        }
    }

    async function publishList(): Promise<string> {
        publishingChanges = true;
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;

        const newPrivateItems = [...privateItems, ...unsavedPrivateItems];
        let jsonPrivateItems: string = "";
        if (newPrivateItems.length > 0) {
            jsonPrivateItems = JSON.stringify(newPrivateItems);
        }

        const list = new NDKList($ndk, {
            kind: data.rawList.kind,
            pubkey: data.pubkey,
            created_at: unixTimeNowInSeconds(),
            content: jsonPrivateItems,
            tags: [...publicItems, ...unsavedPublicItems],
        });

        list.name = data.name;
        list.description = data.description;

        // Encrypt if we need to
        if (newPrivateItems.length > 0) await list.encrypt($currentUser!);

        // Publish
        await list.publish();
        publishingChanges = false;
        return list.encode();
    }
</script>

<div class="flex flex-row items-center justify-between">
    <div class="flex flex-col gap-1">
        <div class="text-base lg:text-lg font-bold flex flex-row items-center gap-2">
            {data.name}
            <Info strokeWidth="1.5" class="w-4 lg:w-5 h-4 lg:h-5" />
            <Tooltip type="light">Kind: {data.kind}</Tooltip>
            <span class="text-sm font-normal">{data.itemCount} items</span>
        </div>
        <span class="italic text-sm">{data.description ? data.description : ""}</span>
    </div>
    <ListActions
        nip19={data.nip19}
        pubkey={data.pubkey}
        listId={data.listId}
        rawList={data.rawList}
        on:listDeleted
    />
</div>
<hr />
<div class="flex flex-col">
    {#if $currentUser?.hexpubkey === data.rawList.pubkey}
        <div transition:slide={{ easing: expoInOut }}>
            <AddItemForm on:addListItem={handleListAddition} />
        </div>
    {/if}

    {#if unpublishedChanges}
        <fieldset class="border border-orange-300 rounded-md p-2">
            <legend class="text-orange-500">Unpublished changes</legend>
            <div class="flex flex-row gap-4 items-center justify-end">
                <ChangesCount
                    additions={[...unsavedPublicItems, ...unsavedPrivateItems]}
                    removals={[...unsavedPublicRemovals, ...unsavedPrivateRemovals]}
                />
                <button
                    on:click={publishList}
                    class="flex flex-row gap-2 items-center border border-orange-600 bg-orange-100 hover:bg-orange-200 p-2 px-3 rounded-md text-sm lg:text-base"
                >
                    <HardDriveUpload strokeWidth="1.5" size="20" />
                    Publish now
                </button>
            </div>

            {#each unsavedPrivateItems as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    privateItem={true}
                    unsaved={true}
                    on:removeUnsavedItem={handleRemoveUnsavedItem}
                />
            {/each}
            {#each unsavedPublicItems as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    privateItem={false}
                    unsaved={true}
                    on:removeUnsavedItem={handleRemoveUnsavedItem}
                />
            {/each}
            {#each unsavedPrivateRemovals as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    privateItem={true}
                    unsaved={true}
                    removal={true}
                    on:removeUnsavedItem={handleRemoveUnsavedItem}
                />
            {/each}
            {#each unsavedPublicRemovals as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    privateItem={false}
                    unsaved={true}
                    removal={true}
                    on:removeUnsavedItem={handleRemoveUnsavedItem}
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
