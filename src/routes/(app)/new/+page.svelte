<script lang="ts">
import { NDKList, NDKNip07Signer, type NDKTag, type NDKUser } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import { AlertTriangle, Check, Info } from "lucide-svelte";
import toast from "svelte-hot-french-toast";
import { zod } from "sveltekit-superforms/adapters";
import { defaults, superForm } from "sveltekit-superforms/client";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod/v3";
import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import Item from "$lib/components/lists/Item.svelte";
import ndk from "$lib/stores/ndk.svelte";
import {
    kindIsRelayList,
    placeholderForListKind,
    stringInputToTag,
    unixTimeNowInSeconds,
    validateTagForListKind,
} from "$lib/utils";

let addItemSubmitting = $state(false);
let addItemError = $state(false);
let addItemErrorMessage = $state("");
let currentUser = $derived(ndk.$currentUser);

const newListSchema = z.object({
    kind: z.string().min(5, "Please select a kind"),
    title: z.string().min(1, "Please give your list a name"),
    description: z.string().optional(),
    category: z.string().optional(),
    publicItems: z.string().array().array().optional(),
    privateItems: z.string().array().array().optional(),
});

const initialNewList = {
    kind: "",
    title: "",
    description: "",
    category: "",
    publicItems: [],
    privateItems: [],
};

const { form, errors, enhance } = superForm(defaults(initialNewList, zod(newListSchema)), {
    taintedMessage: "Are you sure you want to leave the page? Your changes won't be saved.",
    SPA: true,
    validators: zod(newListSchema),
    async onUpdate({ form }) {
        if (form.valid) {
            const nip19Id = await publishList();
            await goto(`/${currentUser?.npub}/${form.data.kind}/${nip19Id}`);
        }
    },
});

async function publishList(): Promise<string> {
    const signer = new NDKNip07Signer();
    ndk.signer = signer;

    const list = new NDKList(ndk, {
        kind: Number.parseInt($form.kind, 10),
        pubkey: currentUser?.pubkey as string,
        created_at: unixTimeNowInSeconds(),
        content: JSON.stringify($form.privateItems),
        tags: $form.publicItems as NDKTag[],
    });

    list.title = $form.title.trim();
    list.description = $form.description?.trim();

    // Only add a "d" tag if needed
    if (list.kind && list.kind >= 30000 && list.kind <= 40000) {
        const uuid = uuidv4();
        list.tags.push(["d", `listr-${uuid}`]);
    }

    if ($form.category) {
        list.tags.push(["L", "lol.listr.ontology"]);
        list.tags.push(["l", $form.category]);
    }

    // Encrypt if we need to
    if (list.content) await list.encrypt(currentUser as NDKUser);
    // Publish
    await list.publish().then(() => toast.success("New list successfully published"));

    return list.encode();
}

async function handleListAddition(e: MouseEvent) {
    e.preventDefault();
    addItemSubmitting = true;
    addItemError = false;
    addItemErrorMessage = "";

    if (browser) {
        const listItemInputEl = document.getElementById("listItem") as HTMLInputElement;
        const listItemTypeEl = document.getElementById("listItemType") as HTMLInputElement;
        const relayReadWriteEl = document.getElementById("relayReadWrite") as HTMLSelectElement;

        // Convert the string input to a NDKTag
        let tag: NDKTag | undefined;
        const markers = relayReadWriteEl ? [relayReadWriteEl.value] : undefined;
        tag = await stringInputToTag(listItemInputEl.value, +$form.kind, markers);

        if (!tag) {
            // Error if we can't parse the input to a tag
            addItemError = true;
            addItemErrorMessage = "Please enter a valid input.";
        } else if (tag && validateTagForListKind(tag, +$form.kind)) {
            if (listItemTypeEl.value === "public")
                $form.publicItems = $form.publicItems ? [...$form.publicItems, tag] : [tag];
            if (listItemTypeEl.value === "private")
                $form.privateItems = $form.privateItems ? [...$form.privateItems, tag] : [tag];
        } else {
            // Error if the type of tag isn't valid for the kind of list
            addItemError = true;
            addItemErrorMessage = "This isn't a valid item for this kind of list.";
            listItemInputEl.value = "";
        }

        // Clean up the input
        listItemInputEl.value = "";
        addItemSubmitting = false;
    }
}

function handleListRemoval(item: string[], privateItem: boolean) {
    if (privateItem) {
        $form.privateItems = $form.privateItems?.filter((listItem) => listItem !== item);
    } else {
        $form.publicItems = $form.publicItems?.filter((listItem) => listItem !== item);
    }
}

let placeholder = $derived(placeholderForListKind(Number.parseInt($form.kind, 10)));
let nameInputDisabled = $derived(Number.parseInt($form.kind, 10) < 30000);

$effect(() => {
    switch (Number.parseInt($form.kind, 10)) {
        case 10000:
            $form.title = "Mute";
            break;
        case 10001:
            $form.title = "Pin";
            break;
        case 10002:
            $form.title = "Relays";
            break;
        case 10003:
            $form.title = "Bookmarks";
            break;
        case 10006:
            $form.title = "Blocked Relays";
            break;
        case 10007:
            $form.title = "Search Relays";
            break;
        case 10015:
            $form.title = "Interests";
            break;
        case 10030:
            $form.title = "Emojis";
            break;
        case 10050:
            $form.title = "DM Receive Relays";
            break;
        case 10051:
            $form.title = "MLS Key Package Relays";
            break;
    }
});
</script>

<svelte:head>
    <title>New List - Listr</title>
    <meta
        name="description"
        content="Create a new list on Listr, the best app for creating and managing your Nostr lists."
    />
</svelte:head>

<div
    class="flex flex-col gap-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-md p-4"
>
    <div class="text-lg font-bold">Create a new list</div>
    <hr class="dark:border-gray-700" />
    {#if currentUser}
        <form class="py-4 flex flex-col gap-4" method="POST" use:enhance>
            <div class="flex flex-col gap-0 relative">
                <label for="kind">What type of list is this?</label>
                <div class=" flex flex-row gap-2 items-center relative">
                    <select
                        name="kind"
                        id="kind"
                        class="border-gray-400 w-full rounded-md bg-transparent"
                        tabindex="0"
                        bind:value={$form.kind}
                    >
                        <option disabled selected value="">What kind of list do you want?</option>
                        <option value="10000">Mute - kind 10000</option>
                        <option value="10001">Pin - kind 10001</option>
                        <option value="10002">Relays - kind 10002</option>
                        <option value="10003">Bookmarks - kind 10003</option>
                        <option value="10006">Blocked Relays - kind 10006</option>
                        <option value="10007">Search Relays - kind 10007</option>
                        <option value="10050">DM Receive Relays - kind 10050</option>
                        <option value="10015">Interests - kind 10015</option>
                        <option value="10030">Emojis - kind 10030</option>
                        <option value="30000">Named Follow Set - kind 30000</option>
                        <option value="30002">Named Relay Set - kind 30002</option>
                        <option value="30003">Named Bookmark Set - kind 30003</option>
                        <option value="30004">Named Curation Set - kind 30004</option>
                        <option value="30015">Named Interest Set - kind 30015</option>
                        <option value="30030">Named Emoji Set - kind 30030</option>
                        <option value="39089">Starter Pack - kind 39089</option>
                    </select>
                    <div class="" tabindex="-1">
                        <Info strokeWidth="1.5" size="20" class="stroke-gray-500 w-5 h-5" />
                        <Tooltip
                            type="auto"
                            class="dark:border-gray-800 dark:text-gray-50 shadow-md text-sm font-normal absolute w-64"
                        >
                            The "Kind" defines what type of list this is.
                        </Tooltip>
                    </div>
                </div>
                {#if $errors.kind}
                    <span class="text-sm text-red-600 italic">{$errors.kind}</span>
                {/if}
                {#if parseInt($form.kind) < 30000}
                    <div
                        class="mt-2 lg:mt-0 lg:absolute flex flex-row gap-2 items-center text-sm -top-4 right-6 p-1 px-2 bg-red-100 dark:bg-red-800 rounded-md"
                    >
                        <AlertTriangle strokeWidth="1.5" size="24" class="shrink-0 w-6 h-6" />
                        <span>
                            Creating a new {$form.title} list will overwrite your current {$form.title}
                            list
                        </span>
                    </div>
                {/if}
            </div>
            <div class="flex flex-col gap-0">
                <label for="name">Name</label>
                <div class=" flex flex-row gap-2 items-center relative">
                    <input
                        type="text"
                        placeholder="Give your list a name..."
                        name="name"
                        id="name"
                        tabindex="0"
                        class="border-gray-400 bg-transparent rounded-md grow w-full disabled:border-gray-600 disabled:text-gray-500"
                        bind:value={$form.title}
                        disabled={nameInputDisabled}
                    />
                    <div class="" tabindex="-1">
                        <Info strokeWidth="1.5" size="20" class="stroke-gray-500 w-5 h-5" />
                        <Tooltip
                            type="auto"
                            class="dark:border-gray-800 dark:text-gray-50 shadow-md text-sm font-normal absolute w-64"
                        >
                            Custom names are only allowed for kinds ≥30,000
                        </Tooltip>
                    </div>
                </div>
                {#if $errors.title}
                    <span class="text-sm text-red-600 italic">{$errors.title}</span>
                {/if}
            </div>
            <div class="flex flex-col gap-0">
                <label for="description">Description</label>
                <div class="flex flex-row items-center relative">
                    <input
                        type="text"
                        placeholder="An optional list description..."
                        name="description"
                        id="description"
                        tabindex="0"
                        class="border-gray-400 bg-transparent rounded-md grow w-full disabled:border-gray-200 disabled:bg-gray-100"
                        bind:value={$form.description}
                    />
                </div>
                {#if $errors.description}
                    <span class="text-sm text-red-600 italic">{$errors.description}</span>
                {/if}
            </div>
            <div class="flex flex-col gap-0">
                <label for="category">Category</label>
                <div class="flex flex-row items-center relative">
                    <select
                        name="category"
                        id="category"
                        class="border-gray-400 w-full rounded-md bg-transparent"
                        tabindex="0"
                        bind:value={$form.category}
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
                </div>
                {#if $errors.category}
                    <span class="text-sm text-red-600 italic">{$errors.category}</span>
                {/if}
            </div>
            <fieldset
                class="border border-gray-700 dark:border-gray-300/60 bg-gray-50 dark:bg-gray-700 rounded-md p-2 flex flex-col gap-2"
            >
                <legend>List Items</legend>
                <div class="">
                    <div class="flex flex-col mb-8">
                        {#if $form.privateItems && $form.privateItems.length > 0}
                            {#each $form.privateItems as privateItem}
                                <div class="flex flex-row gap-8 items-start">
                                    <div class="grow w-full">
                                        <Item
                                            tag={privateItem}
                                            id={privateItem[1]}
                                            listKind={parseInt($form.kind)}
                                            privateItem={true}
                                            removal={false}
                                            editMode={true}
                                            unsaved={true}
                                            removeItem={() => {}}
                                            removeUnsavedItem={() =>
                                                handleListRemoval(privateItem, true)}
                                        />
                                    </div>
                                </div>
                            {/each}
                        {/if}
                        {#if $form.publicItems && $form.publicItems.length > 0}
                            {#each $form.publicItems as publicItem}
                                <div class="flex flex-row gap-8 items-start">
                                    <div class="grow w-full">
                                        <Item
                                            tag={publicItem}
                                            id={publicItem[1]}
                                            listKind={parseInt($form.kind)}
                                            privateItem={false}
                                            unsaved={true}
                                            removal={false}
                                            editMode={true}
                                            removeItem={() => {}}
                                            removeUnsavedItem={() =>
                                                handleListRemoval(publicItem, false)}
                                        />
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                    <div class="flex flex-col lg:flex-row gap-1 items-center">
                        <input
                            type="text"
                            id="listItem"
                            name="listItem"
                            tabindex="0"
                            placeholder={placeholderForListKind(parseInt($form.kind))}
                            class="border-gray-400 bg-transparent rounded-md grow w-full disabled:border-gray-200 disabled:bg-gray-100"
                        />
                        {#if kindIsRelayList(parseInt($form.kind))}
                            <select
                                id="relayReadWrite"
                                name="relayReadWrite"
                                tabindex="0"
                                class="border-gray-400 rounded-md w-full lg:w-auto bg-transparent"
                            >
                                <option value="">Read & Write</option>
                                <option value="read">Read</option>
                                <option value="write">Write</option>
                            </select>
                        {/if}
                        <select
                            id="listItemType"
                            name="listItemType"
                            tabindex="0"
                            class="border-gray-400 bg-transparent rounded-md w-full lg:w-auto"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <button
                            onclick={handleListAddition}
                            tabindex="0"
                            class="w-full lg:w-auto flex bg-transparent justify-center border border-gray-400 bg-green-50 hover:bg-green-200 rounded-md p-2 disabled:border-gray-200 disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500"
                            disabled={addItemSubmitting}
                        >
                            <Check strokeWidth="1.5" size="20" class="w-5 h-5" />
                        </button>
                    </div>
                    {#if addItemError}
                        <span class="text-sm text-red-600 italic">{addItemErrorMessage}</span>
                    {/if}
                </div>
            </fieldset>
            <button
                type="submit"
                id="publishButton"
                tabindex="0"
                class="border border-gray-400 bg-indigo-100 hover:bg-indigo-200 dark:border-green-900 dark:hover:bg-green-600 dark:bg-green-700 dark:hover:text-white rounded-md p-2 disabled:border-gray-200 disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500"
            >
                Publish new list
            </button>
        </form>
    {:else}
        <div>You need to sign in before creating a new list.</div>
    {/if}
</div>

<div
    class="mt-8 flex flex-col gap-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-md p-4"
>
    <div class="text-lg font-bold">How do I know what kind of list to select?</div>
    <hr class="dark:border-gray-700" />
    <div class="prose dark:prose-invert">
        <p>
            At the start, lists in Nostr clients can feel quite complicated. Let's look a bit more
            closely to better understand lists and help answer the question of what type of list you
            want to create.
        </p>
        <p>
            The basic distinction in lists comes down to whether they are a standardized list or a
            named list (set).
        </p>
        <h3>Standardized Lists</h3>
        <p>
            Standardized lists are in the 10000-19999 range of kinds. You don't need to worry about
            the kind number in specific, just that lists in this range have a predefined name and
            use. For example, your "Mute" list (kind 10000) is used to mute users, keywords, and
            threads.
        </p>
        <p>
            Importantly, you can only have 1 active standardized list of a given kind. When you
            create a new Mute list, your old list is lost and replaced by the newer list.
        </p>
        <p>
            But what if you want to create multiple lists of the same kind? That's what named lists
            are for.
        </p>
        <h3>Named Lists (Sets)</h3>
        <p>
            Named lists are in the 30000-39999 range of kinds. You'll also see these referred to as
            Sets. The point of named lists is that you can give your list a custom name, and you can
            many of the same kind of list active at any given time.
        </p>
        <p>
            For example, I can create multiple named follow sets, each with a different purpose.
            Maybe one set is people that relate to climbing, another set is people who create great
            memes.
        </p>
        <p>
            Named lists are great for organizing people and content that you care about and sharing
            it with others. And in many cases, you can include your named lists or sets into your
            standard lists. For example, you can add a named follow set to your Mute list.
        </p>
    </div>
</div>
