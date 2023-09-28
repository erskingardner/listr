<script lang="ts">
    import { GitFork } from "lucide-svelte";
    import { NDKList, NDKNip07Signer, type NostrEvent } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { unixTimeNowInSeconds } from "$lib/utils";
    import { Popover } from "flowbite-svelte";
    import toast from "svelte-french-toast";
    import { v4 as uuidv4 } from "uuid";

    export let rawList: NostrEvent;

    let name: string;
    let description: string;

    async function createForkList() {
        if (!$ndk.signer) {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
        }

        const tags = rawList.tags.filter((tag) => !["d", "name", "description"].includes(tag[0]));
        // Only add a "d" tag if needed
        const uuid = uuidv4();
        tags.push(["d", `listr-${uuid}`]);

        const forkedList = new NDKList($ndk, {
            pubkey: $currentUser!.hexpubkey,
            kind: rawList.kind,
            content: "",
            created_at: unixTimeNowInSeconds(),
            tags: tags,
        });
        forkedList.name = name;
        forkedList.description = description;

        forkedList
            .publish()
            .then(() => toast.success("New list created & published"))
            .catch((error) => console.error("Error publishing list", error));
    }
</script>

<button id="forkButton" class="primaryActionButton">
    <GitFork strokeWidth="1.5" size="20" class="w-5 h-5" />
    Fork
</button>

<Popover
    title="Fork this list (create a personal copy)"
    triggeredBy="#forkButton"
    trigger="click"
    placement="left-end"
    defaultClass="py-2 px-3 text-black dark:text-white"
>
    <div class="panel-contents flex flex-col gap-2">
        <form
            on:submit|preventDefault={createForkList}
            class="flex flex-col gap-2 justify-start items-start"
        >
            <label for="name" class="w-full">
                Name *
                <input
                    type="text"
                    bind:value={name}
                    name="name"
                    class="rounded-md bg-transparent w-full text-sm"
                    placeholder="A name for your list"
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
                <GitFork strokeWidth="1.5" size="20" class="w-5 h-5" />
                Fork this list
            </button>
        </form>
    </div>
</Popover>
