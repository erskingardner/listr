<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import { ListPlus } from "lucide-svelte";

    export let user: NDKUser;

    async function handleAddToList() {
        if ($currentUser !== user) {
            console.log("Add to another list");
        }
    }
</script>

<button on:click={handleAddToList} class="primaryActionButton">
    <ListPlus size="20" strokeWidth="1.5" />
    Add to another list
</button>
