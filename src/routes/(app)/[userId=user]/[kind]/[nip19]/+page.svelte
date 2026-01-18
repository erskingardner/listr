<script lang="ts">
import {
    type NDKEvent,
    NDKKind,
    NDKList,
    type NDKTag,
    type NDKUser,
    type NDKUserProfile,
    type NostrEvent,
} from "@nostr-dev-kit/ndk";
import { Breadcrumb, BreadcrumbItem, Tooltip } from "flowbite-svelte";
import { HardDriveUpload, Home, Info } from "lucide-svelte";
import { nip19 } from "nostr-tools";
import { expoInOut } from "svelte/easing";
import { slide } from "svelte/transition";
import toast from "svelte-hot-french-toast";
import { v4 as uuidv4 } from "uuid";
import { afterNavigate, beforeNavigate, invalidateAll } from "$app/navigation";
import { page } from "$app/stores";
import ListActions from "$lib/components/lists/actions/ListActions.svelte";
import AddItemForm from "$lib/components/lists/forms/AddItemForm.svelte";
import ChangesCount from "$lib/components/lists/forms/ChangesCount.svelte";
import Item from "$lib/components/lists/Item.svelte";
import UserListNav from "$lib/components/lists/UserListNav.svelte";
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte.js";
import type { AddressPointer, ListItemParams } from "$lib/types";
import {
    deduplicateItems,
    ensurePubkeys,
    getListDisplayTitle,
    unixTimeNowInSeconds,
} from "$lib/utils";

let currentUser = $derived(getCurrentUser());

let profile: NDKUserProfile | null = $state(null);
let event: NDKEvent | null = $state(null);

let userId = $derived($page.params.userId);
let user = $derived(ndk.getUser({ npub: userId }));
let listNip19 = $derived($page.params.nip19);
let decodedListNip19: AddressPointer | null = $derived(
    listNip19 ? (nip19.decode(listNip19).data as AddressPointer) : null
);
let kind = $derived(Number.parseInt($page.params.kind, 10));
let rawList = $derived.by(() => (event ? (event?.rawEvent() as NostrEvent) : null));
let list = $derived.by(() => (event ? NDKList.from(event as NDKEvent) : null));
let initialPrivateItems: NDKTag[] = $state([]);
let initialPublicItems: NDKTag[] = $state([]);
let privateItems: NDKTag[] = $state([]);
let publicItems: NDKTag[] = $state([]);
let unsavedPublicItems: NDKTag[] = $state([]);
let unsavedPrivateItems: NDKTag[] = $state([]);
let unsavedPublicRemovals: NDKTag[] = $state([]);
let unsavedPrivateRemovals: NDKTag[] = $state([]);
let listTitle: string | undefined = $state(undefined);
let listDescription: string | undefined = $state(undefined);
let listCategory: string | undefined = $state(undefined);
let initialListTitle: string | undefined = $state(undefined);
let initialListDescription: string | undefined = $state(undefined);
let initialListCategory: string | undefined = $state(undefined);

let publishingChanges = $state(false);
let editMode = $state(false);
let drawerVisible = $state(false);

let unpublishedChanges = $derived(
    unsavedPrivateItems.length > 0 ||
        unsavedPrivateRemovals.length > 0 ||
        unsavedPublicItems.length > 0 ||
        unsavedPublicRemovals.length > 0 ||
        listTitle !== initialListTitle ||
        listDescription !== initialListDescription ||
        listCategory !== initialListCategory
);

let itemCount = $derived.by(() => {
    publicItems.filter(
        (item) =>
            ![
                "L",
                "l",
                "d",
                "image",
                "thumb",
                "summary",
                "alt",
                "expiration",
                "subject",
                "title",
                "description",
            ].includes(item[0])
    ).length + (privateItems?.length || 0);
});

$effect(() => {
    if (user && !profile) {
        user.fetchProfile().then((fetchedProfile) => {
            profile = fetchedProfile;
        });
    }

    if (listNip19 && (!event || event.dTag !== decodedListNip19?.identifier)) {
        fetchEvent();
    }
});

function fetchEvent() {
    ndk.fetchEvent(listNip19).then((fetchedEvent) => {
        event = fetchedEvent;
        let tmpList = NDKList.from(event as NDKEvent);
        listTitle = getListDisplayTitle(tmpList);
        listDescription = tmpList.description;
        listCategory = tmpList.tags.find((tag: NDKTag) => tag[0] === "l")?.[1] || undefined;
        initialListTitle = listTitle;
        initialListDescription = listDescription;
        initialListCategory = listCategory;
        updateListItems();
    });
}

function updateListItems() {
    if (!list) return;
    if (list.content.length > 0 && currentUser?.user?.pubkey === list.pubkey) {
        list.encryptedTags().then((tags) => {
            // Svelte keyed each will blow up if we send lists with duplicate items
            privateItems = deduplicateItems(tags);
            initialPrivateItems = privateItems;
        });
    }
    // Svelte keyed each will blow up if we send lists with duplicate items
    publicItems = deduplicateItems(list.items);
    if (list.kind === NDKKind.Contacts) {
        publicItems = ensurePubkeys(publicItems);
    }
    initialPublicItems = publicItems;
}

beforeNavigate(() => {
    if (unpublishedChanges) {
        confirm("You have unpublished changes. Are you sure you want to leave the page?");
    }
});

afterNavigate(() => clearTempStores());

function clearTempStores() {
    privateItems = initialPrivateItems || [];
    publicItems = initialPublicItems;
    unsavedPublicItems = [];
    unsavedPrivateItems = [];
    unsavedPublicRemovals = [];
    unsavedPrivateRemovals = [];
    listTitle = initialListTitle;
    listDescription = initialListDescription;
    listCategory = initialListCategory;
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
    }
    return false;
}

function handleListAddition(tag: NDKTag, type: string) {
    if (!itemAlreadyIncluded(tag)) {
        if (type === "public") {
            unsavedPublicItems.push(tag);
        } else if (type === "private") {
            unsavedPrivateItems.push(tag);
        }
    }
}

function handleListRemoval(params: ListItemParams) {
    let removedTag = [params.type, params.id];
    if (params.otherTagValues) removedTag = [...removedTag, ...params.otherTagValues];

    if (params.privateItem) {
        unsavedPrivateRemovals.push(removedTag);
        privateItems = privateItems?.filter(
            (tag) => !(tag[0] === removedTag[0] && tag[1] === removedTag[1])
        );
    } else {
        unsavedPublicRemovals.push(removedTag);
        publicItems = publicItems.filter(
            (tag) => !(tag[0] === removedTag[0] && tag[1] === removedTag[1])
        );
    }
}

function handleRemoveUnsavedItem(params: ListItemParams) {
    let replacedTag = [params.type, params.id];
    if (params.otherTagValues) replacedTag = [...replacedTag, ...params.otherTagValues];

    if (params.privateItem) {
        // Only put it back if it was a removal to start with
        if (params.removal) {
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
        if (params.removal) {
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

async function publishList(): Promise<void> {
    publishingChanges = true;

    try {
        const newPrivateItems = [...privateItems, ...unsavedPrivateItems];
        let jsonPrivateItems = "";
        if (newPrivateItems.length > 0) {
            jsonPrivateItems = JSON.stringify(newPrivateItems);
        }
        if (!rawList) {
            toast.error("Something went wrong. Please try again.");
            console.error("No raw list found when publishing");
            return;
        }

        // Create a plain object with the necessary properties
        const listData = {
            kind: rawList.kind,
            pubkey: rawList.pubkey,
            created_at: unixTimeNowInSeconds(),
            content: jsonPrivateItems,
            tags: [...publicItems, ...unsavedPublicItems].map((tag) => [...tag]), // Create new array instances
        };

        const list = new NDKList(ndk, listData);

        list.title = listTitle;
        list.description = listDescription;

        if (listCategory) {
            list.tags.push(["L", "lol.listr.ontology"]);
            list.tags.push(["l", listCategory]);
        }

        let newListConfirmation = true;
        if (list.kind && list.kind >= 30000 && list.kind <= 40000) {
            const listTags = rawList.tags;
            const dTagValue = listTags.filter((tag) => tag[0] === "d")[0][1];

            if (dTagValue === list.title) {
                newListConfirmation = confirm(
                    "Updating this list will upgrade the format of the list to allow editing the list name going forward. Do you want to proceed?\n\nWe suggest deleting the original list after the new list is created."
                );
                const uuid = uuidv4();
                list.tags.push(["d", `listr-${uuid}`]);
            } else {
                list.tags.push(["d", dTagValue]);
            }
        }

        if (newPrivateItems.length > 0) {
            await list.encrypt(currentUser?.user as NDKUser);
        }

        if (newListConfirmation) {
            await list.publish();
            toast.success("Your list was successfully published");
            publishingChanges = false;
            editMode = false;
            clearTempStores();
            invalidateAll();
        }
    } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
    } finally {
        publishingChanges = false;
        fetchEvent();
    }
}

function toggleEditMode() {
    let confirmLeaveEdit = true;
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

let displayableName = $derived.by(() => {
    if (profile || user) {
        return (
            profile?.displayName ||
            profile?.name ||
            profile?.nip05 ||
            `${user?.npub.slice(0, 9)}...`
        );
    }
    return "";
});

function toggleDrawerVisible() {
    drawerVisible = !drawerVisible;
}
</script>

<svelte:head>
    <title>{`${listTitle} - Listr`}</title>
    <meta name="description" content={`${listTitle} a list on Listr`} />
</svelte:head>

{#snippet homeIcon()}
    <Home strokeWidth="1.5" size="16" class="w-4 h-4 shrink-0" />
{/snippet}

{#if user && list}
    <Breadcrumb
        aria-label="User list breadcrumb"
        class="flex flex-row gap-2 w-full my-6"
        olClass="flex flex-row gap-2 items-center w-full"
    >
        <BreadcrumbItem
            href="/feed"
            homeClass="flex flex-row gap-1.5 items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white "
            home
            icon={homeIcon}
        >
            Activity Feed
        </BreadcrumbItem>
        <BreadcrumbItem href="/{user.npub}" class="flex flex-row gap-1.5 items-center"
            >{displayableName}</BreadcrumbItem
        >
        <BreadcrumbItem class="flex flex-row gap-1.5 items-center">{listTitle}</BreadcrumbItem>
    </Breadcrumb>

    <!-- List of the user's lists -->
    <div class="flex flex-row gap-6">
        {#if rawList}
            {#if currentUser?.user?.pubkey === rawList.pubkey}
                <!-- Don't render inside user list nav if it's the current user's list -->
            {:else}
                <div
                    class="text-sm hidden lg:flex flex-col gap-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-md p-4 w-[18rem] shrink-0"
                >
                    {#key rawList.pubkey}
                        <UserListNav userPubkey={rawList.pubkey} />
                    {/key}
                </div>
            {/if}
        {/if}

        {#if rawList && list}
            <!-- List contents -->
            <div
                class="flex flex-col gap-2 border border-gray-30 dark:border-gray-700 rounded-md shadow-md p-4 grow"
            >
                <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div class="flex flex-col gap-1 w-full lg:w-auto">
                        <div
                            class="text-base lg:text-lg font-bold flex flex-row justify-start items-center gap-2"
                        >
                            {listTitle}
                            {#if currentUser?.settings?.devMode}
                                <Info strokeWidth="1.5" class="w-4 lg:w-5 h-4 lg:h-5" />
                                <Tooltip
                                    type="auto"
                                    class="dark:border-gray-800 dark:text-gray-50 shadow-md"
                                >
                                    k: {kind}
                                </Tooltip>
                            {/if}
                            <span class="text-sm font-normal">{itemCount} items</span>
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
                        nip19={listNip19}
                        pubkey={rawList.pubkey}
                        listId={list.tagId()}
                        {rawList}
                        {editMode}
                        {toggleEditMode}
                    />
                </div>
                <hr class="dark:border-gray-700" />
                <div class="flex flex-col">
                    {#if currentUser?.user?.pubkey === rawList.pubkey && editMode}
                        <div transition:slide={{ easing: expoInOut }}>
                            <form class="flex flex-col gap-2">
                                <label for="listTitle" class="font-medium">Name</label>
                                <input
                                    type="text"
                                    name="listTitle"
                                    bind:value={listTitle}
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
                            <AddItemForm {kind} addListItem={handleListAddition} />
                        </div>
                    {/if}

                    {#if unpublishedChanges}
                        <fieldset
                            class="border border-gray-700 dark:border-gray-300/60 bg-gray-50 dark:bg-gray-700 rounded-md p-2"
                        >
                            <legend>Unpublished changes</legend>
                            <div class="flex flex-col lg:flex-row gap-4 lg:items-center justify-end">
                                <ChangesCount
                                    titleChanged={listTitle !== initialListTitle}
                                    descriptionChanged={listDescription !== initialListDescription}
                                    additions={[...unsavedPublicItems, ...unsavedPrivateItems]}
                                    removals={[...unsavedPublicRemovals, ...unsavedPrivateRemovals]}
                                />
                                <button
                                    onclick={publishList}
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
                                    listKind={kind}
                                    privateItem={true}
                                    unsaved={true}
                                    removal={false}
                                    {editMode}
                                    removeItem={handleListRemoval}
                                    removeUnsavedItem={handleRemoveUnsavedItem}
                                />
                            {/each}
                            {#each unsavedPublicItems as item (item[1])}
                                <Item
                                    id={item[1]}
                                    tag={item}
                                    listKind={kind}
                                    privateItem={false}
                                    unsaved={true}
                                    removal={false}
                                    {editMode}
                                    removeItem={handleListRemoval}
                                    removeUnsavedItem={handleRemoveUnsavedItem}
                                />
                            {/each}
                            {#each unsavedPrivateRemovals as item (item[1])}
                                <Item
                                    id={item[1]}
                                    tag={item}
                                    listKind={kind}
                                    privateItem={true}
                                    unsaved={true}
                                    removal={true}
                                    {editMode}
                                    removeItem={handleListRemoval}
                                    removeUnsavedItem={handleRemoveUnsavedItem}
                                />
                            {/each}
                            {#each unsavedPublicRemovals as item (item[1])}
                                <Item
                                    id={item[1]}
                                    tag={item}
                                    listKind={kind}
                                    privateItem={false}
                                    unsaved={true}
                                    removal={true}
                                    {editMode}
                                    removeItem={handleListRemoval}
                                    removeUnsavedItem={handleRemoveUnsavedItem}
                                />
                            {/each}
                        </fieldset>
                    {/if}

                    {#each privateItems || [] as item (item[1])}
                        <Item
                            id={item[1]}
                            tag={item}
                            listKind={kind}
                            privateItem={true}
                            unsaved={false}
                            removal={false}
                            {editMode}
                            removeItem={handleListRemoval}
                            removeUnsavedItem={handleRemoveUnsavedItem}
                        />
                    {/each}
                    {#each publicItems || [] as item (item[1])}
                        <Item
                            id={item[1]}
                            tag={item}
                            listKind={kind}
                            privateItem={false}
                            unsaved={false}
                            removal={false}
                            {editMode}
                            removeItem={handleListRemoval}
                            removeUnsavedItem={handleRemoveUnsavedItem}
                        />
                    {/each}
                </div>
            </div>
        {/if}
    </div>
{/if}
