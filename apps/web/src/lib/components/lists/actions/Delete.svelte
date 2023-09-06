<script lang="ts">
    import { Trash2 } from "lucide-svelte";
    import currentUser from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
    import { Tooltip } from "flowbite-svelte";
    import { unixTimeNowInSeconds } from "$lib/utils";
    import { NDKNip07Signer, NDKEvent } from "@nostr-dev-kit/ndk";
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";
    import { db } from "@nostr-dev-kit/ndk-cache-dexie";

    const dispatch = createEventDispatcher();

    export let listId: string;
    export let pubkey: string;

    async function deleteList(event: any) {
        if (!$ndk.signer) {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
        }

        // Create & publish list deletion event (kind 5)
        const deleteEvent = new NDKEvent($ndk, {
            kind: 5,
            pubkey: $currentUser?.hexpubkey as string,
            content: "List deleted by owner",
            tags: [["a", listId as string]],
            created_at: unixTimeNowInSeconds(),
        });
        deleteEvent
            .publish()
            .then(() => {
                db.events.delete(listId).catch((error) => console.error(error));
                dispatch("listDeleted", { event: deleteEvent.rawEvent() });
                goto(`/${$currentUser?.npub}`);
            })
            .catch((error) => {
                console.error(error);
            });
    }
</script>

{#if $currentUser?.hexpubkey === pubkey}
    <button on:click={deleteList}>
        <Trash2 strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
    </button>
    <Tooltip type="light">Delete this list</Tooltip>
{/if}
