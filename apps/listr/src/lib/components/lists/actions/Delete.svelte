<script lang="ts">
    import { Trash2 } from "lucide-svelte";
    import currentUser from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
    import { unixTimeNowInSeconds } from "$lib/utils";
    import { NDKNip07Signer, NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";
    import { db } from "@nostr-dev-kit/ndk-cache-dexie";
    import toast from "svelte-french-toast";

    const dispatch = createEventDispatcher();

    export let listId: string;
    export let pubkey: string;

    async function deleteList() {
        const deleteConfirmation = confirm(
            "Are you sure you want to delete this list? This cannot be undone."
        );
        if (deleteConfirmation) {
            if (!$ndk.signer) {
                const signer = new NDKNip07Signer();
                $ndk.signer = signer;
            }

            // Create & publish list deletion event (kind 5)
            const deleteEvent = new NDKEvent($ndk, {
                kind: NDKKind.EventDeletion,
                pubkey: $currentUser?.pubkey as string,
                content: "List deleted by owner",
                tags: [["a", listId as string]],
                created_at: unixTimeNowInSeconds(),
            });

            deleteEvent
                .publish()
                .then(() => {
                    db.events.delete(listId).catch((error) => console.error(error));
                    dispatch("listDeleted", { event: deleteEvent.rawEvent() });
                    toast.success("Your list was deleted");
                    goto(`/${$currentUser?.npub}`);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
</script>

{#if $currentUser?.pubkey === pubkey}
    <button on:click={deleteList} class="popoverActionButton">
        <Trash2 strokeWidth="1.5" size="20" class="stroke-black dark:stroke-white w-5 h-5" />
        Delete list
    </button>
{/if}
