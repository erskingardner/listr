<script lang="ts">
    import Item from "$lib/components/lists/Item.svelte";
    import { HardDriveUpload, Info } from "lucide-svelte";
    import ListActions from "$lib/components/lists/actions/ListActions.svelte";
    import { Tooltip } from "flowbite-svelte";
    import AddItemForm from "$lib/components/lists/forms/AddItemForm.svelte";
    import { NDKList, NDKNip07Signer, type NDKTag } from "@nostr-dev-kit/ndk";
    import { slide } from "svelte/transition";
    import { expoInOut } from "svelte/easing";
    import { afterNavigate, beforeNavigate, invalidateAll } from "$app/navigation";
    import currentUser from "$lib/stores/currentUser";
    import ChangesCount from "$lib/components/lists/forms/ChangesCount.svelte";
    import { unixTimeNowInSeconds } from "$lib/utils";
    import ndk from "$lib/stores/ndk.js";
    import { v4 as uuidv4 } from "uuid";

    export let data;

    let privateItems: NDKTag[] = data.privateItems || [];
    let publicItems: NDKTag[] = data.items;
    let unsavedPublicItems: NDKTag[] = [];
    let unsavedPrivateItems: NDKTag[] = [];
    let unsavedPublicRemovals: NDKTag[] = [];
    let unsavedPrivateRemovals: NDKTag[] = [];

    let unpublishedChanges: boolean = false;

    let publishingChanges: boolean = false;

    let editMode: boolean = false;

    let listName = data.name;
    let listDescription = data.description;

    $: unpublishedChanges =
        unsavedPrivateItems.length > 0 ||
        unsavedPrivateRemovals.length > 0 ||
        unsavedPublicItems.length > 0 ||
        unsavedPublicRemovals.length > 0 ||
        listName !== data.name ||
        listDescription !== data.description;

    beforeNavigate(() => {
        if (unpublishedChanges) {
            confirm("You have unpublished changes. Are you sure you want to leave the page?");
        }
    });

    afterNavigate(() => clearTempStores());

    function clearTempStores() {
        privateItems = data.privateItems || [];
        publicItems = data.items;
        unsavedPublicItems = [];
        unsavedPrivateItems = [];
        unsavedPublicRemovals = [];
        unsavedPrivateRemovals = [];
        listName = data.name;
        listDescription = data.description;
    }

    function handleListAddition(event: CustomEvent) {
        if (event.detail.type === "public") {
            unsavedPublicItems.push(event.detail.tag);
            unsavedPublicItems = unsavedPublicItems;
        } else if (event.detail.type === "private") {
            unsavedPrivateItems.push(event.detail.tag);
            unsavedPrivateItems = unsavedPrivateItems;
        }
    }

    function handleListRemoval(event: CustomEvent) {
        let removedTag = [event.detail.type, event.detail.id];
        if (event.detail.otherTagValues)
            removedTag = [...removedTag, ...event.detail.otherTagValues];

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

    function handleRemoveUnsavedItem(event: CustomEvent) {
        let replacedTag = [event.detail.type, event.detail.id];
        if (event.detail.otherTagValues)
            replacedTag = [...replacedTag, ...event.detail.otherTagValues];

        if (event.detail.privateItem) {
            // Only put it back if it was a removal to start with
            if (event.detail.removal) {
                privateItems = [replacedTag, ...privateItems];
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
                publicItems = [replacedTag, ...publicItems];
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

    async function publishList(): Promise<string | void> {
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

        list.name = listName;
        list.description = listDescription;

        let newListConfirmation: boolean = true;
        // This will create a new list for older style lists with a name the same as the d tag.
        if (list.kind! >= 30000 && list.kind! <= 40000) {
            const listTags = data.rawList.tags;
            const dTagValue = listTags.filter((tag) => tag[0] === "d")[0][1];

            if (dTagValue === list.name) {
                newListConfirmation = confirm(
                    "Updating this list will upgrade the format of the list to allow editing the list name going forward. Do you want to proceed?\n\nWe suggest deleting the original list after the new list is created."
                );
                const uuid = uuidv4();
                list.tags.push(["d", `listr-${uuid}`]);
            } else {
                list.tags.push(["d", dTagValue]);
            }
        }

        // Encrypt if we need to
        if (newPrivateItems.length > 0) await list.encrypt($currentUser!);

        if (newListConfirmation) {
            // Publish
            await list.publish().catch((error) => {
                if (error === "User rejected") {
                    console.log("Rejected");
                    publishingChanges = false;
                }
            });
            publishingChanges = false;
            clearTempStores();
            invalidateAll();
            return list.encode();
        } else {
            publishingChanges = false;
        }
    }

    function toggleEditMode() {
        let confirmLeaveEdit: boolean = true;
        if (editMode && unpublishedChanges) {
            confirmLeaveEdit = confirm(
                "You have unpublished changes that will be discarded. Are you sure you want to stop editing?"
            );
        }
        if (confirmLeaveEdit) {
            editMode = !editMode;
            clearTempStores();
        }
    }
</script>

<div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
    <div class="flex flex-col gap-1 w-full lg:w-auto">
        <div class="text-base lg:text-lg font-bold flex flex-row justify-start items-center gap-2">
            {listName}
            <Info strokeWidth="1.5" class="w-4 lg:w-5 h-4 lg:h-5" />
            <Tooltip type="auto" class="dark:border-gray-800 dark:text-gray-50 shadow-md">
                Kind: {data.kind}
            </Tooltip>
            <span class="text-sm font-normal">{data.itemCount} items</span>
        </div>
        <span class="italic text-sm">
            {listDescription ? listDescription : ""}
        </span>
    </div>
    <ListActions
        nip19={data.nip19}
        pubkey={data.pubkey}
        listId={data.listId}
        rawList={data.rawList}
        {editMode}
        on:listDeleted
        on:toggleEditMode={toggleEditMode}
    />
</div>
<hr class="dark:border-gray-700" />
<div class="flex flex-col">
    {#if $currentUser?.hexpubkey === data.rawList.pubkey && editMode}
        <div transition:slide={{ easing: expoInOut }}>
            <form class="flex flex-col gap-2">
                <label for="listName" class="font-medium">Name</label>
                <input
                    type="text"
                    name="listName"
                    bind:value={listName}
                    class="border-gray-400 col-span-2 rounded-md bg-transparent disabled:border-gray-200 disabled:bg-gray-100 text-sm"
                />
                <label for="listDescription" class="font-medium">Description</label>
                <input
                    type="text"
                    name="listDescription"
                    bind:value={listDescription}
                    class="border-gray-400 col-span-2 rounded-md bg-transparent disabled:border-gray-200 disabled:bg-gray-100 text-sm"
                />
            </form>
            <AddItemForm on:addListItem={handleListAddition} />
        </div>
    {/if}

    {#if unpublishedChanges}
        <fieldset
            class="border border-gray-700 dark:border-gray-300/60 bg-gray-50 dark:bg-gray-700 rounded-md p-2"
        >
            <legend>Unpublished changes</legend>
            <div class="flex flex-col lg:flex-row gap-4 lg:items-center justify-end">
                <ChangesCount
                    nameChanged={listName !== data.name}
                    descriptionChanged={listDescription !== data.description}
                    additions={[...unsavedPublicItems, ...unsavedPrivateItems]}
                    removals={[...unsavedPublicRemovals, ...unsavedPrivateRemovals]}
                />
                <button
                    on:click={publishList}
                    disabled={publishingChanges}
                    class="flex flex-row gap-2 justify-center items-center border border-green-500 dark:border-green-900 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 p-2 px-3 rounded-md text-sm lg:text-base"
                >
                    <HardDriveUpload strokeWidth="1.5" size="20" class="w-5 h-5" />
                    Publish now
                </button>
            </div>

            <div class="flex flex-col gap-1"></div>

            {#each unsavedPrivateItems as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    kind={data.kind}
                    privateItem={true}
                    unsaved={true}
                    on:removeUnsavedItem={handleRemoveUnsavedItem}
                />
            {/each}
            {#each unsavedPublicItems as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    kind={data.kind}
                    privateItem={false}
                    unsaved={true}
                    on:removeUnsavedItem={handleRemoveUnsavedItem}
                />
            {/each}
            {#each unsavedPrivateRemovals as item (item[1])}
                <Item
                    id={item[1]}
                    tag={item}
                    kind={data.kind}
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
                    kind={data.kind}
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
            kind={data.kind}
            privateItem={true}
            unsaved={false}
            {editMode}
            on:removeItem={handleListRemoval}
        />
    {/each}
    {#each publicItems || [] as item (item[1])}
        <Item
            id={item[1]}
            tag={item}
            kind={data.kind}
            privateItem={false}
            unsaved={false}
            {editMode}
            on:removeItem={handleListRemoval}
        />
    {/each}
</div>
