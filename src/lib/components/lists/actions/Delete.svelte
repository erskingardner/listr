<script lang="ts">
import { db } from "@nostr-dev-kit/cache-dexie";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { Trash2 } from "lucide-svelte";
import toast from "svelte-hot-french-toast";
import { goto } from "$app/navigation";
import ndk from "$lib/stores/ndk.svelte";
import { unixTimeNowInSeconds } from "$lib/utils";

let { listId, pubkey, listDeleted }: { listId: string; pubkey: string; listDeleted: () => void } =
    $props();

let currentUser = $derived(ndk.$currentUser);

async function deleteList() {
    if (!currentUser) return;

    const deleteConfirmation = confirm(
        "Are you sure you want to delete this list? This cannot be undone."
    );
    if (deleteConfirmation && currentUser) {
        // Create & publish list deletion event (kind 5)
        const deleteEvent = new NDKEvent(ndk, {
            kind: NDKKind.EventDeletion,
            pubkey: currentUser.pubkey,
            content: "List deleted by owner",
            tags: [["a", listId as string]],
            created_at: unixTimeNowInSeconds(),
        });

        deleteEvent
            .publish()
            .then(() => {
                db.events.delete(listId).catch((error: Error) => console.error(error));
                listDeleted();
                toast.success("Your list was deleted");
                goto(`/${currentUser?.npub}`);
            })
            .catch((error: Error) => {
                console.error(error);
            });
    }
}
</script>

{#if currentUser?.pubkey === pubkey}
    <button onclick={deleteList} class="popoverActionButton">
        <Trash2 strokeWidth="1.5" size="20" class="stroke-black dark:stroke-white w-5 h-5" />
        Delete list
    </button>
{/if}
