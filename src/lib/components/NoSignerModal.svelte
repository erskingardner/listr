<script lang="ts">
import { Modal } from "flowbite-svelte";

let { modalOpen = $bindable() }: { modalOpen: boolean } = $props();
</script>

<Modal
    title="Nostr signing extension not found"
    bind:open={modalOpen}
    placement="top-center"
    backdropClass="fixed inset-0 z-40 bg-black/60"
>
    <div class="p-4">
        <p class="text-gray-900 dark:text-white mb-4">
            Listr is an app built on <span class="font-bold">Nostr</span>. To log in and manage your
            lists you need to sign events with your Nostr keys using a browser extension like Alby
            or nos2x in Chrome or Brave.
        </p>
        <p class="text-gray-900 dark:text-white mb-4">
            If you're unsure what Nostr is and want to learn more please check out <a
                href="https://nostr.how?utm_source=listr&utm_medium=signerModal">Nostr.how</a
            >
        </p>
    </div>
    <svelte:fragment slot="footer">
        <div
            class="my-6 flex flex-col gap-8 md:flex-row items-center justify-center md:justify-around w-full"
        >
            <a
                href="https://getalby.com?utm_source=listr&utm_medium=signerModal"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0 whitespace-nowrap"
                target="_blank"
            >
                <span class="">Get Alby</span>
            </a>
            <a
                href="https://github.com/fiatjaf/nos2x"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0 whitespace-nowrap"
                target="_blank"
            >
                <span class="">Get nos2x</span>
            </a>
            <a
                href="https://nostr.how?utm_source=listr&utm_medium=signerModal"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0 whitespace-nowrap"
                target="_blank"
            >
                <span class="">Learn more</span>
            </a>
        </div>
    </svelte:fragment>
</Modal>
