<script lang="ts">
    import { CopyPlus } from "lucide-svelte";
    import { NDKList, NDKNip07Signer, type NostrEvent } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { unixTimeNowInSeconds } from "$lib/utils";
    import { Popover } from "flowbite-svelte";
    import toast from "svelte-french-toast";
    import { v4 as uuidv4 } from "uuid";

    export let rawList: NostrEvent;

    let title: string;
    let description: string;

    async function createDuplicateList() {
        if (!$ndk.signer) {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
        }

        const tags = rawList.tags.filter(
            (tag) => !["d", "name", "title", "description"].includes(tag[0])
        );
        // Only add a "d" tag if needed
        const uuid = uuidv4();
        tags.push(["d", `listr-${uuid}`]);

        const duplicateList = new NDKList($ndk, {
            pubkey: $currentUser!.hexpubkey,
            kind: rawList.kind,
            content: "",
            created_at: unixTimeNowInSeconds(),
            tags: tags,
        });
        duplicateList.title = title;
        duplicateList.description = description;

        duplicateList
            .publish()
            .then(() => toast.success("New list created & published"))
            .catch((error) => console.error("Error publishing list", error));
    }
</script>

<button id="duplicateButton" class="primaryActionButton">
    <CopyPlus strokeWidth="1.5" size="20" class="w-5 h-5" />
    Duplicate
</button>

<Popover
    title="Create a personal copy of this list"
    triggeredBy="#duplicateButton"
    trigger="click"
    placement="left-end"
    defaultClass="py-2 px-3 text-black dark:text-white"
>
    <div class="panel-contents flex flex-col gap-2">
        <form
            on:submit|preventDefault={createDuplicateList}
            class="flex flex-col gap-2 justify-start items-start"
        >
            <label for="title" class="w-full">
                Title *
                <input
                    type="text"
                    bind:value={title}
                    name="title"
                    class="rounded-md bg-transparent w-full text-sm"
                    placeholder="A title for your list"
                    required
                />
            </label>
            <label for="description">
                Description *
                <input
                    type="text"
                    bind:value={description}
                    name="description"
                    class="rounded-md bg-transparent w-full text-sm"
                    placeholder="A short description for your list"
                    required
                />
            </label>
            <button
                type="submit"
                class="w-full flex flex-row items-center mt-2 gap-1 rounded-md p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white"
            >
                <CopyPlus strokeWidth="1.5" size="20" class="w-5 h-5" />
                Duplicate this list
            </button>
        </form>
    </div>
</Popover>
