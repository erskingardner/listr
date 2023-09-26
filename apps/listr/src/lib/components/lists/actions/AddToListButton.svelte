<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import { Tooltip } from "flowbite-svelte";
    import { ListPlus } from "lucide-svelte";

    export let user: NDKUser;

    async function handleAddToList() {
        if ($currentUser !== user) {
            console.log("Soon™");
        }
    }
</script>

<button
    on:click={handleAddToList}
    class="primaryActionButton w-full justify-center whitespace-nowrap"
>
    <ListPlus size="20" strokeWidth="1.5" class="w-5 h-5" />
    Add to list
</button>
<Tooltip type="auto" class="dark:border-gray-800 dark:text-gray-50 shadow-md">
    Coming soon...
</Tooltip>
