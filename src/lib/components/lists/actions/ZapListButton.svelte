<script lang="ts">
    import { Zap } from "lucide-svelte";
    import { Popover } from "flowbite-svelte";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { NDKNip07Signer, NDKEvent, type NDKZapDetails } from "@nostr-dev-kit/ndk";
    import { zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";
    import { onMount, onDestroy, beforeUpdate } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
    import toast from "svelte-french-toast";
    import type { LnPaymentInfo, NDKPaymentConfirmationLN } from "@nostr-dev-kit/ndk";
    import { requestProvider, type SendPaymentResponse } from "webln";

    export let listId: string;
    export let nip19: string;
    let amount: number = 21;
    let comment: string;

    let popoverOpen: boolean = false;
    let totalZaps = 0;
    let alreadyZapped = false;
    let zaps: NDKEventStore<ExtendedBaseType<NDKEvent>>;

    zaps = $ndk.storeSubscribe({ kinds: [9735], "#a": [listId as string] }, { closeOnEose: true });
    onMount(() => {
        zaps = $ndk.storeSubscribe(
            { kinds: [9735], "#a": [listId as string] },
            { closeOnEose: true }
        );
    });

    beforeUpdate(() => zaps?.unsubscribe());
    onDestroy(() => zaps?.unsubscribe());

    afterNavigate(() => {
        alreadyZapped = false;
        zaps = $ndk.storeSubscribe(
            { kinds: [9735], "#a": [listId as string] },
            { closeOnEose: true }
        );
    });

    // TODO: THIS IS BROKEN - Fix and add the list zap back again
    async function submitZap() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        const event = await $ndk.fetchEvent(nip19 as string);

        if (!event) {
            console.log("No event to zap");
            return;
        }
        console.log("Zapping event", event);

        $ndk.zap(event, amount * 1000, {
            comment,
            onLnPay: async (invoice: NDKZapDetails<LnPaymentInfo>) => {
                const zapRequest = zapInvoiceFromEvent(invoice.target as NDKEvent);
                try {
                    const webln = await requestProvider();
                    const paymentResponse = await webln.sendPayment(JSON.stringify(zapRequest));
                    console.log("Payment response", paymentResponse);
                    return { preimage: paymentResponse.preimage } as NDKPaymentConfirmationLN;
                } catch (error: any) {
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

    $: {
        totalZaps = $zaps
            .map((event) => {
                const zapInvoice = zapInvoiceFromEvent(event as unknown as NDKEvent);
                alreadyZapped = zapInvoice?.zappee === $currentUser?.pubkey;
                return (zapInvoice?.amount || 0) / 1000;
            })
            .reduce((subTotal, value) => subTotal + value, 0);
    }
</script>

<button
    on:click={() => (popoverOpen = true)}
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
        {#if $currentUser}
            <form
                on:submit|preventDefault={submitZap}
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
