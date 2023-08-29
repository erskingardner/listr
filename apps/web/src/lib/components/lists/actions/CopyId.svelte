<script lang="ts">
    import { Copy, CopyCheck } from "lucide-svelte";
    import { copyToClipboard } from "$lib/utils";
    import { Tooltip } from "flowbite-svelte";

    export let nip19: string;

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

<button on:click={copyListId}>
    {#if copySuccess}
        <CopyCheck strokeWidth="1.5" size="20" class="stroke-green-500" />
    {:else}
        <Copy strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
    {/if}
</button>
<Tooltip type="light">Copy list ID</Tooltip>
