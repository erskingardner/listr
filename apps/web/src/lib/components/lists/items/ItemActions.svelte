<script lang="ts">
    import { X, Copy, CopyCheck, MoreVertical, ExternalLink } from "lucide-svelte";
    import { Popover } from "flowbite-svelte";
    import { createEventDispatcher } from "svelte";
    import { aTagToNip19, copyToClipboard } from "$lib/utils";
    import { nip19 } from "nostr-tools";
    import currentUser from "$lib/stores/currentUser";
    import { page } from "$app/stores";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";

    const dispatch = createEventDispatcher();

    export let type: string;
    export let id: string;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;

    let copySuccess: boolean = false;

    let itemCopyString: string;
    let itemCopyName: string = "ID";
    let primalUrl: string | undefined;
    let hashedId: string | undefined = undefined;

    if (type === "r" || type === "a") {
        hashedId = btoa(id).slice(0, 8);
    }

    // If it's an a we need the parts to construct an naddr;
    let naddrId: string = "";
    if (type === "a") {
        naddrId = aTagToNip19([type, id]);
    }

    switch (type) {
        case "p":
            itemCopyString = nip19.npubEncode(id);
            primalUrl = `https://primal.net/p/${itemCopyString}`;
            break;
        case "e":
            itemCopyString = nip19.noteEncode(id);
            primalUrl = `https://primal.net/e/${itemCopyString}`;
            break;
        case "a":
            itemCopyString = naddrId;
            primalUrl = undefined;
            break;
        case "r":
            itemCopyString = id;
            itemCopyName = "URL";
            primalUrl = undefined;
            break;
        case "emoji":
            itemCopyString = id;
            itemCopyName = "Name";
            primalUrl = undefined;
            break;
        default:
            console.error("Unknown ID");
    }

    async function copyItemId(nip19: string) {
        copyToClipboard(nip19).then(() => {
            copySuccess = true;
            setTimeout(() => {
                copySuccess = false;
            }, 1500);
        });
    }
</script>

{#key id}
    <button id="actions-{hashedId ? hashedId : itemCopyString}" class="ml-auto">
        <MoreVertical
            strokeWidth="1.5"
            size="20"
            class="stroke-gray-500 hover:stroke-black w-5 h-5"
        />
    </button>
    <Popover triggeredBy="#actions-{hashedId ? hashedId : itemCopyString}" placement="left-start">
        <div class="flex flex-col gap-2 items-start grow">
            <button on:click={() => copyItemId(itemCopyString)} class="popoverActionButton">
                {#if copySuccess}
                    <CopyCheck strokeWidth="1.5" size="20" class="stroke-green-500 w-5 h-5" />
                {:else}
                    <Copy strokeWidth="1.5" size="20" class="stroke-gray-500 w-5 h-5" />
                {/if}
                Copy {itemCopyName}
            </button>
            {#if primalUrl}
                <a href={primalUrl} target="_blank" class="popoverActionButton shrink-0">
                    <ExternalLink strokeWidth="1.5" size="20" class="stroke-gray-500 w-5 h-5" />
                    Open in Primal
                </a>
            {/if}
        </div>
    </Popover>
{/key}
