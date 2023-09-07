<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    import { superForm, superValidateSync } from "sveltekit-superforms/client";
    import { AlertTriangle, Check, Info, X } from "lucide-svelte";
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
        name: z.string().min(1, "Please give your list a name"),
        description: z.string().optional(),
        publicItems: z.string().array().max(3).array().optional(),
        privateItems: z.string().array().max(3).array().optional(),
    });

    const { form, errors, enhance } = superForm(superValidateSync(newListSchema), {
        taintedMessage: "Are you sure you want to leave the page? Your changes won't be saved.",
        SPA: true,
        validators: newListSchema,
        async onUpdate({ form }) {
            if (form.valid) {
                const nip19Id = await publishList();
                toast.success("New list published");
                await goto(`/${$currentUser!.npub}/${$form.kind}/${nip19Id}`);
            }
        },
    });

    async function publishList(): Promise<string> {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;

        const list = new NDKList($ndk, {
            kind: parseInt($form.kind),
            pubkey: $currentUser!.hexpubkey,
            created_at: unixTimeNowInSeconds(),
            content: JSON.stringify($form.privateItems),
            tags: $form.publicItems as NDKTag[],
        });

        list.name = $form.name;
        list.description = $form.description;

        // Only add a "d" tag if needed
        if (list.kind! >= 30000 && list.kind! <= 40000) {
            const uuid = uuidv4();
            list.tags.push(["d", `listr-${uuid}`]);
        }

        // Encrypt if we need to
        if (list.content) await list.encrypt($currentUser!);
        // Publish
        await list.publish();

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

    $: if ($form.kind === "10000") $form.name = "Mute";
    $: if ($form.kind === "10001") $form.name = "Pin";
</script>

<div class="flex flex-col gap-2 border border-gray-300 rounded-md shadow-md p-4 grow">
    <div class="text-lg font-bold">Create a new list</div>
    <hr />
    {#if $currentUser}
        <form class="py-4 flex flex-col gap-4" method="POST" use:enhance>
            <div class="flex flex-col gap-0 relative">
                <label for="kind">Kind</label>
                <select
                    name="kind"
                    id="kind"
                    class="border-gray-400 lg:w-2/3 rounded-md"
                    tabindex="0"
                    bind:value={$form.kind}
                >
                    <option value="">What kind of list?</option>
                    <option value="10000">Mute list: Kind 10000</option>
                    <option value="10001">Pin list: Kind 10001</option>
                    <option value="30000">People list: Kind 30000</option>
                    <option value="30001">Bookmarks list: Kind 30001</option>
                </select>
                {#if $errors.kind}
                    <span class="text-sm text-red-600 italic">{$errors.kind}</span>
                {/if}
                {#if $form.kind === "10000" || $form.kind === "10001"}
                    <div
                        class="mt-2 lg:mt-0 lg:absolute flex flex-row gap-2 items-center lg:w-1/4 text-sm top-4 right-0 p-2 bg-red-100 rounded-md"
                    >
                        <AlertTriangle strokeWidth="1.5" size="24" class="shrink-0" />
                        <span
                            >Creating a new {$form.name} list will overwrite your current {$form.name}
                            list</span
                        >
                    </div>
                {/if}
            </div>
            <div class="flex flex-col gap-0">
                <label for="name">Name</label>
                <div class="lg:w-2/3 flex flex-row items-center relative">
                    <input
                        type="text"
                        placeholder="First choose a list kind..."
                        name="name"
                        id="name"
                        tabindex="0"
                        class="border-gray-400 rounded-md grow w-full disabled:border-gray-200 disabled:bg-gray-100"
                        bind:value={$form.name}
                        disabled={nameInputDisabled}
                    />
                    <div class="absolute -right-20 w-28" tabindex="-1">
                        <Info strokeWidth="1.5" size="20" class="stroke-gray-500" />
                        <Tooltip
                            type="custom"
                            class="bg-white rounded-md text-sm font-normal absolute border border-gray-300"
                        >
                            Custom names are only allowed for kinds ≥30000
                        </Tooltip>
                    </div>
                </div>
                {#if $errors.name}
                    <span class="text-sm text-red-600 italic">{$errors.name}</span>
                {/if}
            </div>
            <div class="flex flex-col gap-0">
                <label for="name">Description</label>
                <div class="lg:w-2/3 flex flex-row items-center relative">
                    <input
                        type="text"
                        placeholder="An optional list description..."
                        name="description"
                        id="description"
                        tabindex="0"
                        class="border-gray-400 rounded-md grow w-full disabled:border-gray-200 disabled:bg-gray-100"
                        bind:value={$form.description}
                    />
                </div>
                {#if $errors.description}
                    <span class="text-sm text-red-600 italic">{$errors.description}</span>
                {/if}
            </div>
            <fieldset class="border border-gray-300 rounded-md p-2 flex flex-col gap-2">
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
                                        />
                                    </div>
                                    <button
                                        on:click|preventDefault={() =>
                                            handleListRemoval(privateItem, true)}
                                        class="my-2 w-full lg:w-auto flex justify-center border border-gray-400 bg-red-50 hover:bg-red-200 rounded-md p-2 disabled:border-gray-200 disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500"
                                    >
                                        <X strokeWidth="1.5" />
                                    </button>
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
                                        />
                                    </div>
                                    <button
                                        on:click|preventDefault={() =>
                                            handleListRemoval(publicItem, false)}
                                        class="my-2 w-full lg:w-auto flex justify-center border border-gray-400 bg-red-50 hover:bg-red-200 rounded-md p-2 disabled:border-gray-200 disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500"
                                    >
                                        <X strokeWidth="1.5" />
                                    </button>
                                </div>
                            {/each}
                        {/if}
                    </div>
                    <div class="flex flex-col lg:flex-row gap-1 items-center lg:w-2/3">
                        <input
                            type="text"
                            id="listItem"
                            name="listItem"
                            tabindex="0"
                            placeholder="NIP-19 identifier (npub, nprofile, note, nevent, or naddr)"
                            class="border-gray-400 rounded-md grow w-full disabled:border-gray-200 disabled:bg-gray-100"
                        />
                        <select
                            id="listItemType"
                            name="listItemType"
                            tabindex="0"
                            class="border-gray-400 rounded-md w-full lg:w-auto"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <button
                            on:click|preventDefault={handleListAddition}
                            tabindex="0"
                            class="w-full lg:w-auto flex justify-center border border-gray-400 bg-green-50 hover:bg-green-200 rounded-md p-2 disabled:border-gray-200 disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500"
                            disabled={addItemSubmitting}
                        >
                            <Check strokeWidth="1.5" />
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
                class="border border-gray-400 bg-indigo-100 hover:bg-indigo-200 rounded-md lg:w-2/3 p-2 disabled:border-gray-200 disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500"
            >
                Publish new list
            </button>
        </form>
    {:else}
        <div>You need to sign in before creating a new list.</div>
    {/if}
</div>
