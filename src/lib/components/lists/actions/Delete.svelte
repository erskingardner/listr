<script lang="ts">
import { goto } from "$app/navigation";
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte";
import { unixTimeNowInSeconds } from "$lib/utils";
import { NDKEvent, NDKKind, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { db } from "@nostr-dev-kit/ndk-cache-dexie";
import { Trash2 } from "lucide-svelte";
import toast from "svelte-hot-french-toast";

let { listId, pubkey, listDeleted }: { listId: string; pubkey: string; listDeleted: () => void } =
    $props();

let currentUser = $derived(getCurrentUser());

async function deleteList() {
    if (!currentUser) return;

    const deleteConfirmation = confirm(
        "Are you sure you want to delete this list? This cannot be undone."
    );
    if (deleteConfirmation && currentUser.user) {
        // Create & publish list deletion event (kind 5)
        const deleteEvent = new NDKEvent(ndk, {
            kind: NDKKind.EventDeletion,
            pubkey: currentUser.user.pubkey,
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
                goto(`/${currentUser.user?.npub}`);
            })
            .catch((error: Error) => {
                console.error(error);
            });
    }
}
</script>

{#if currentUser.user?.pubkey === pubkey}
    <button onclick={deleteList} class="popoverActionButton">
        <Trash2 strokeWidth="1.5" size="20" class="stroke-black dark:stroke-white w-5 h-5" />
        Delete list
    </button>
{/if}
