<script lang="ts">
    import { GitFork } from "lucide-svelte";
    import { NDKList, NDKNip07Signer, type NostrEvent } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { unixTimeNowInSeconds } from "$lib/utils";
    import { Popover, Tooltip } from "flowbite-svelte";
    import toast from "svelte-french-toast";

    export let rawList: NostrEvent;

    let name: string;
    let description: string;

    async function createForkList() {
        if (!$ndk.signer) {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
        }

        const tags = rawList.tags.filter((tag) => !["d", "name", "description"].includes(tag[0]));
        tags.push(["d", name]);

        const forkedList = new NDKList($ndk, {
            pubkey: $currentUser!.hexpubkey(),
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

<button id="forkButton">
    <GitFork strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
</button>
<Tooltip type="light">Fork this list (create a personal copy)</Tooltip>
<Popover
    title="Fork this list (create a personal copy)"
    triggeredBy="#forkButton"
    trigger="click"
    placement="left-end"
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
                <GitFork strokeWidth="1.5" size="20" />
                Fork this list
            </button>
        </form>
    </div>
</Popover>
