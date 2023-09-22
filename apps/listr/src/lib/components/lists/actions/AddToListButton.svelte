<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
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

<button on:click={handleAddToList} class="primaryActionButton grow justify-center">
    <ListPlus size="20" strokeWidth="1.5" class="w-5 h-5" />
    Add to list
</button>
<Tooltip type="light">Coming soon...</Tooltip>
