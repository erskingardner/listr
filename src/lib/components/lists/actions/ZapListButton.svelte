<script lang="ts">
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte";
import {
    type LnPaymentInfo,
    NDKEvent,
    NDKNip07Signer,
    type NDKPaymentConfirmationLN,
    type NDKSubscription,
    type NDKZapDetails,
} from "@nostr-dev-kit/ndk";
import { zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";
import { Popover } from "flowbite-svelte";
import { Zap } from "lucide-svelte";
import { onDestroy, onMount } from "svelte";
import toast from "svelte-hot-french-toast";
import { type SendPaymentResponse, requestProvider } from "webln";

let { listId, nip19 }: { listId: string; nip19: string } = $props();

let currentUser = $derived(getCurrentUser());
let amount = $state(21);
let comment = $state("");

let popoverOpen = $state(false);
let totalZaps = $state(0);
let alreadyZapped = $state(false);

let zaps: NDKEvent[] = $state([]);
let zapsSub: NDKSubscription | null = $state(null);

onMount(() => {
    zapsSub = ndk.subscribe({ kinds: [9735], "#a": [listId as string] }, { closeOnEose: false });

    zapsSub.on("event", (event: NDKEvent) => {
        zaps = [...zaps, event];
    });
});

onDestroy(() => zapsSub?.stop());

$effect(() => {
    totalZaps = zaps
        .map((event: NDKEvent) => {
            const zapInvoice = zapInvoiceFromEvent(event);
            if (currentUser?.user) {
                alreadyZapped = zapInvoice?.zappee === currentUser.user.pubkey;
            }
            return (zapInvoice?.amount || 0) / 1000;
        })
        .reduce((subTotal, value) => subTotal + value, 0);
});

// TODO: THIS IS BROKEN - Fix and add the list zap back again
async function submitZap(e: Event) {
    e.preventDefault();
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    const event = await ndk.fetchEvent(nip19 as string);

    if (!event) {
        console.log("No event to zap");
        return;
    }
    console.log("Zapping event", event);

    ndk.zap(event, amount * 1000, {
        comment,
        onLnPay: async (invoice: NDKZapDetails<LnPaymentInfo>) => {
            const zapRequest = zapInvoiceFromEvent(invoice.target as NDKEvent);
            try {
                const webln = await requestProvider();
                const paymentResponse = await webln.sendPayment(JSON.stringify(zapRequest));
                console.log("Payment response", paymentResponse);
                return { preimage: paymentResponse.preimage } as NDKPaymentConfirmationLN;
            } catch (error) {
                console.log("payment error:", error);
                toast.error("Zap failed. Please try again.");
            }
        },
        onComplete: (results) => {
            console.log("Zap results", results);
            let hasError = false;
            results.forEach((result, key) => {
                if (result instanceof Error) {
                    hasError = true;
                    console.error(`Error for ${key}:`, result);
                }
            });

            if (hasError) {
                toast.error("Error zapping list. Please check the console for details.");
            } else {
                toast.success("Zap successful!");
                popoverOpen = false;
            }
        },
    });
}
</script>

<button
    onclick={() => (popoverOpen = true)}
    class="flex flex-row gap-1 items-center text-sm lg:text-base"
>
    <Zap
        strokeWidth="1.5"
        class="hover:fill-yellow-500 {alreadyZapped
            ? 'fill-yellow-500 stroke-yellow-500'
            : 'stroke-gray-500'} hover:stroke-yellow-500 w-4 lg:w-5 h-4 lg:h-5"
    />
    {totalZaps || 0}
</button>
<Popover
    bind:open={popoverOpen}
    trigger="click"
    placement="left-end"
    class="dark:text-gray-50 dark:bg-gray-700 z-30"
>
    <div class="panel-contents flex flex-col gap-2">
        {#if currentUser?.user}
            <form
                onsubmit={submitZap}
                class="flex flex-col gap-2 justify-start items-start"
            >
                <label for="amount"
                    >Amount *
                    <input
                        type="text"
                        bind:value={amount}
                        name="amount"
                        class="rounded-md bg-transparent w-full text-sm"
                        required
                    />
                </label>
                <label for="comment"
                    >Comment
                    <input
                        type="text"
                        bind:value={comment}
                        name="comment"
                        class="rounded-md bg-transparent w-full text-sm"
                        placeholder="Zap comment"
                    />
                </label>
                <button
                    type="submit"
                    class="w-full flex flex-row justify-center items-center mt-2 gap-1 rounded-md p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white text-center"
                >
                    <Zap
                        strokeWidth="1.5"
                        class="stroke-yellow-500 fill-yellow-500 w-5 h-5"
                        size="20"
                    />
                    Zap this list
                </button>
            </form>
            <div class="flex flex-col items-center">
                <span>or</span>
                <a
                    href="https://www.makeprisms.com/create/{nip19}"
                    class="w-full mt-2 gap-1 rounded-md p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white text-center"
                >
                    Zap everyone on this list via Prism
                </a>
            </div>
        {:else}
            Please sign in to zap.
        {/if}
    </div>
</Popover>
