<script lang="ts">
import { copyToClipboard } from "$lib/utils";
import { Copy, CopyCheck } from "lucide-svelte";

let {
    nip19,
    size = "20",
    showText = true,
    extraClasses,
}: {
    nip19: string;
    size?: string;
    showText?: boolean;
    extraClasses?: string;
} = $props();

let copySuccess = $state(false);

async function copyListId() {
    copyToClipboard(nip19).then(() => {
        copySuccess = true;
        setTimeout(() => {
            copySuccess = false;
        }, 1500);
    });
}
</script>

<button onclick={copyListId} class="popoverActionButton dark:text-white {extraClasses}">
    {#if copySuccess}
        <CopyCheck strokeWidth="1.5" {size} class="stroke-green-500" />
    {:else}
        <Copy strokeWidth="1.5" {size} class="stroke-black dark:stroke-white" />
    {/if}
    {#if showText}
        Copy ID
    {/if}
</button>
