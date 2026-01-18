<script lang="ts">
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import { ListPlus } from "lucide-svelte";
import { getCurrentUser } from "$lib/stores/currentUser.svelte";

let {
    user,
    extraClasses,
}: {
    user: NDKUser;
    extraClasses?: string;
} = $props();

let currentUser = $derived(getCurrentUser());
async function handleAddToList() {
    if (currentUser?.user !== user) {
        console.log("Soon™");
    }
}
</script>

<button
    onclick={handleAddToList}
    class="primaryActionButton w-full justify-center whitespace-nowrap {extraClasses}"
>
    <ListPlus size="20" strokeWidth="1.5" class="w-5 h-5" />
    Add to list
</button>
<Tooltip type="auto" class="dark:border-gray-800 dark:text-gray-50 shadow-md whitespace-nowrap">
    Coming soon...
</Tooltip>
