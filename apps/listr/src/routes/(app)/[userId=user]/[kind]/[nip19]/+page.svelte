<script lang="ts">
    import Item from "$lib/components/lists/Item.svelte";
    import { HardDriveUpload, Home, Info } from "lucide-svelte";
    import ListActions from "$lib/components/lists/actions/ListActions.svelte";
    import { Tooltip, Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
    import AddItemForm from "$lib/components/lists/forms/AddItemForm.svelte";
    import { NDKList, NDKNip07Signer, type NDKTag } from "@nostr-dev-kit/ndk";
    import { slide } from "svelte/transition";
    import { expoInOut } from "svelte/easing";
    import { afterNavigate, beforeNavigate, invalidateAll } from "$app/navigation";
    import currentUser, { currentUserSettings } from "$lib/stores/currentUser";
    import ChangesCount from "$lib/components/lists/forms/ChangesCount.svelte";
    import { unixTimeNowInSeconds } from "$lib/utils";
    import ndk from "$lib/stores/ndk.js";
    import { v4 as uuidv4 } from "uuid";
    import UserListNav from "$lib/components/lists/UserListNav.svelte";
    import toast from "svelte-french-toast";

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
    let listCategory = data.category;

    $: unpublishedChanges =
        unsavedPrivateItems.length > 0 ||
        unsavedPrivateRemovals.length > 0 ||
        unsavedPublicItems.length > 0 ||
        unsavedPublicRemovals.length > 0 ||
        listName !== data.name ||
        listDescription !== data.description ||
        listCategory !== data.category;

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
        listCategory = data.category;
    }

    function itemAlreadyIncluded(tag: NDKTag): boolean {
        const alreadyIncluded = [
            ...publicItems,
            ...privateItems,
            ...unsavedPublicItems,
            ...unsavedPrivateItems,
        ]
            .map((item) => item[1])
            .includes(tag[1]);

        if (alreadyIncluded) {
            toast.error("You already have that item in your list, you can't add it again.");
            return true;
        } else {
            return false;
        }
    }

    function handleListAddition(event: CustomEvent) {
        if (!itemAlreadyIncluded(event.detail.tag)) {
            if (event.detail.type === "public") {
                unsavedPublicItems.push(event.detail.tag);
                unsavedPublicItems = unsavedPublicItems;
            } else if (event.detail.type === "private") {
                unsavedPrivateItems.push(event.detail.tag);
                unsavedPrivateItems = unsavedPrivateItems;
            }
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

        if (listCategory) {
            list.tags.push(["L", "lol.listr.ontology"]);
            list.tags.push(["l", listCategory]);
        }

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
            list.publish()
                .then(() => {
                    toast.success("Your list was successfully published");
                    publishingChanges = false;
                    editMode = false;
                    clearTempStores();
                    invalidateAll();
                })
                .catch((error) => {
                    if (error === "User rejected") {
                        console.log("Rejected");
                        publishingChanges = false;
                    }
                });

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

<svelte:head>
    <title>{`${listName} - Listr`}</title>
    <meta name="description" content={`${listName} a list on Listr`} />
</svelte:head>

<Breadcrumb
    aria-label="User list breadcrumb"
    navClass="flex flex-row gap-2 w-full my-6"
    classOl="flex flex-row gap-2 items-center w-full"
>
    <BreadcrumbItem
        href="/feed"
        homeClass="flex flex-row gap-1.5 items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white "
        home
    >
        <svelte:fragment slot="icon">
            <Home strokeWidth="1.5" size="16" class="w-4 h-4 shrink-0" />
        </svelte:fragment>
        Activity Feed
    </BreadcrumbItem>
    <BreadcrumbItem href="/{data.npub}" class="flex flex-row gap-1.5 items-center"
        >{data.profile?.displayName}</BreadcrumbItem
    >
    <BreadcrumbItem class="flex flex-row gap-1.5 items-center">{listName}</BreadcrumbItem>
</Breadcrumb>

<!-- List of the user's lists -->
<div class="flex flex-row gap-6">
    {#if $currentUser?.hexpubkey === data.pubkey}
        <!-- Don't render inside user list nav if it's the current user's list -->
    {:else}
        <div
            class="text-sm hidden lg:flex flex-col gap-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-md p-4 w-[18rem] shrink-0"
        >
            {#key data.pubkey}
                <UserListNav userPubkey={data.pubkey} />
            {/key}
        </div>
    {/if}

    <!-- List contents -->
    <div
        class="flex flex-col gap-2 border border-gray-30 dark:border-gray-700 rounded-md shadow-md p-4 grow"
    >
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div class="flex flex-col gap-1 w-full lg:w-auto">
                <div
                    class="text-base lg:text-lg font-bold flex flex-row justify-start items-center gap-2"
                >
                    {listName}
                    {#if $currentUserSettings?.devMode}
                        <Info strokeWidth="1.5" class="w-4 lg:w-5 h-4 lg:h-5" />
                        <Tooltip
                            type="auto"
                            class="dark:border-gray-800 dark:text-gray-50 shadow-md"
                        >
                            k: {data.kind}
                        </Tooltip>
                    {/if}
                    <span class="text-sm font-normal">{data.itemCount} items</span>
                </div>
                <span class="text-sm flex gap-2 items-center">
                    {listDescription ? listDescription : ""}
                    {#if listCategory}
                        <span
                            class="text-2xs text-white md:text-xs px-1.5 md:px-2 md:py-0.5 bg-indigo-600 rounded-full"
                        >
                            {listCategory}
                        </span>
                    {/if}
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
                        <label for="listCategory" class="font-medium">Category</label>
                        <select
                            name="listCategory"
                            class="border-gray-400 w-full rounded-md bg-transparent"
                            tabindex="0"
                            bind:value={listCategory}
                        >
                            <option selected value="">Add a category to your list?</option>
                            <option value="Books & Literature">Books & Literature</option>
                            <option value="Finance & Money">Finance & Money</option>
                            <option value="Food & Drink">Food & Drink</option>
                            <option value="Gaming & Hobbies">Gaming & Hobbies</option>
                            <option value="Movies & TV">Movies & TV</option>
                            <option value="Music">Music</option>
                            <option value="People">People</option>
                            <option value="Politics">Politics</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Sports">Sports</option>
                            <option value="Technology">Technology</option>
                            <option value="Travel & Places">Travel & Places</option>
                        </select>
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
    </div>
</div>
