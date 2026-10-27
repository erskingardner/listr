<script lang="ts">
import { ListPlus } from "@lucide/svelte";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import ndk from "#lib/stores/ndk.svelte.ts";

let {
    user,
    extraClasses,
}: {
    user: NDKUser;
    extraClasses?: string;
} = $props();

let currentUser = $derived(ndk.$currentUser);
async function handleAddToList() {
    if (currentUser !== user) {
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
