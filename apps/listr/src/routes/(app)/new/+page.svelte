<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    import { superForm, superValidateSync } from "sveltekit-superforms/client";
    import { AlertTriangle, Check, Info } from "lucide-svelte";
    import { Tooltip } from "flowbite-svelte";
    import { browser } from "$app/environment";
    import { NOSTR_BECH32_REGEXP, unixTimeNowInSeconds, nip19ToTag } from "$lib/utils";
    import Item from "$lib/components/lists/Item.svelte";
    import { z } from "zod";
    import ndk from "$lib/stores/ndk";
    import { NDKList, NDKNip07Signer, type NDKTag } from "@nostr-dev-kit/ndk";
    import { goto } from "$app/navigation";
    import toast from "svelte-french-toast";
    import { v4 as uuidv4 } from "uuid";

    let nameInputDisabled: boolean = true;
    let addItemSubmitting: boolean = false;
    let addItemError: boolean = false;
    let addItemErrorMessage: string = "";

    const newListSchema = z.object({
        kind: z.string().min(5, "Please select a kind"),
        title: z.string().min(1, "Please give your list a name"),
        description: z.string().optional(),
        category: z.string().optional(),
        publicItems: z.string().array().array().optional(),
        privateItems: z.string().array().array().optional(),
    });

    const { form, errors, enhance } = superForm(superValidateSync(newListSchema), {
        taintedMessage: "Are you sure you want to leave the page? Your changes won't be saved.",
        SPA: true,
        validators: newListSchema,
        async onUpdate({ form }) {
            if (form.valid) {
                const nip19Id = await publishList();
                // eslint-disable-next-line svelte/valid-compile
                await goto(`/${$currentUser!.npub}/${$form.kind}/${nip19Id}`);
            }
        },
    });

    async function publishList(): Promise<string> {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;

        const list = new NDKList($ndk, {
            kind: parseInt($form.kind),
            pubkey: $currentUser!.pubkey,
            created_at: unixTimeNowInSeconds(),
            content: JSON.stringify($form.privateItems),
            tags: $form.publicItems as NDKTag[],
        });

        list.title = $form.title.trim();
        list.description = $form.description?.trim();

        // Only add a "d" tag if needed
        if (list.kind! >= 30000 && list.kind! <= 40000) {
            const uuid = uuidv4();
            list.tags.push(["d", `listr-${uuid}`]);
        }

        if ($form.category) {
            list.tags.push(["L", "lol.listr.ontology"]);
            list.tags.push(["l", $form.category]);
        }

        // Encrypt if we need to
        if (list.content) await list.encrypt($currentUser!);
        // Publish
        await list.publish().then(() => toast.success("New list successfully published"));

        return list.encode();
    }

    function handleListAddition() {
        addItemSubmitting = true;
        addItemError = false;
        addItemErrorMessage = "";

        if (browser) {
            const listItemInputEl = document.getElementById("listItem") as HTMLInputElement;
            const listItemTypeEl = document.getElementById("listItemType") as HTMLInputElement;

            if (listItemInputEl.value.match(NOSTR_BECH32_REGEXP)) {
                const tag = nip19ToTag(listItemInputEl.value);
                if (listItemTypeEl.value === "public")
                    $form.publicItems = $form.publicItems ? [...$form.publicItems, tag] : [tag];
                if (listItemTypeEl.value === "private")
                    $form.privateItems = $form.privateItems ? [...$form.privateItems, tag] : [tag];
            } else {
                addItemError = true;
                addItemErrorMessage = "Please enter a valid NIP-19 identifier";
            }
            listItemInputEl.value = "";
        }
        addItemSubmitting = false;
    }

    function handleListRemoval(item: string[], privateItem: boolean) {
        if (privateItem) {
            $form.privateItems = $form.privateItems?.filter((listItem) => listItem !== item);
        } else {
            $form.publicItems = $form.publicItems?.filter((listItem) => listItem !== item);
        }
    }

    $: nameInputDisabled = parseInt($form.kind) < 30000;

    $: if ($form.kind === "10000") $form.title = "Mute";
    $: if ($form.kind === "10001") $form.title = "Pin";
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
    {#if $currentUser}
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
                        <option value="30000">Categorized People - kind 30000</option>
                        <option value="30001">Categorized Bookmarks - kind 30001</option>
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
                {#if $form.kind === "10000" || $form.kind === "10001"}
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
                                            privateItem={true}
                                            unsaved={true}
                                            on:removeUnsavedItem={() =>
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
                                            privateItem={false}
                                            unsaved={true}
                                            on:removeUnsavedItem={() =>
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
                            placeholder="NIP-19 identifier (npub, nprofile, note, nevent, or naddr)"
                            class="border-gray-400 bg-transparent rounded-md grow w-full disabled:border-gray-200 disabled:bg-gray-100"
                        />
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
                            on:click|preventDefault={handleListAddition}
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
        <div>You need to sign in before creating a new list. Sign in now.</div>
    {/if}
</div>
