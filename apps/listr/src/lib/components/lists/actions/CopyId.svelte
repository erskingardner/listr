<script lang="ts">
    import { Copy, CopyCheck } from "lucide-svelte";
    import { copyToClipboard } from "$lib/utils";

    export let nip19: string;
    export let size: string = "20";
    export let showText: boolean = true;

    let copySuccess: boolean = false;

    async function copyListId() {
        copyToClipboard(nip19).then(() => {
            copySuccess = true;
            setTimeout(() => {
                copySuccess = false;
            }, 1500);
        });
    }
</script>

<button on:click={copyListId} class="popoverActionButton {$$props.class}">
    {#if copySuccess}
        <CopyCheck strokeWidth="1.5" {size} class="stroke-green-500" />
    {:else}
        <Copy
            strokeWidth="1.5"
            {size}
            class="stroke-black hover:stroke-gray-900 dark:stroke-gray-300 dark:hover:stroke-white"
        />
    {/if}
    {#if showText}
        Copy ID
    {/if}
</button>
