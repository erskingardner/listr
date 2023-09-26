<script lang="ts">
    import { Zap } from "lucide-svelte";
    import { Popover } from "flowbite-svelte";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { NDKNip07Signer, NDKEvent } from "@nostr-dev-kit/ndk";
    import { zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";
    // import { requestProvider } from "webln";
    import { onMount, onDestroy, beforeUpdate } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";

    export let listId: string;
    export let nip19: string;
    let amount: number = 402;
    let comment: string;

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

    async function submitZap() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        const event = await $ndk.fetchEvent(nip19 as string);
        let zapRequest = await event?.zap(amount * 1000, comment);

        if (!zapRequest) {
            console.log("No payment request");
            return;
        }

        try {
            // const webln = await requestProvider();
        } catch (error: unknown) {
            console.log(error);
        }
    }

    $: {
        totalZaps = $zaps
            .map((event) => {
                const zapInvoice = zapInvoiceFromEvent(event as unknown as NDKEvent);
                alreadyZapped = zapInvoice?.zappee === $currentUser?.hexpubkey;
                return (zapInvoice?.amount || 0) / 1000;
            })
            .reduce((subTotal, value) => subTotal + value, 0);
    }
</script>

<button id="zapButton" class="flex flex-row gap-1 items-center text-sm lg:text-base">
    <Zap
        strokeWidth="1.5"
        class="hover:fill-yellow-500 {alreadyZapped
            ? 'fill-yellow-500 stroke-yellow-500'
            : 'stroke-gray-500'} hover:stroke-yellow-500 w-4 lg:w-5 h-4 lg:h-5"
    />
    {totalZaps || 0}
</button>
<Popover
    triggeredBy="#zapButton"
    trigger="click"
    placement="left-end"
    class="dark:text-gray-50 dark:bg-gray-700"
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
                    class="w-full flex flex-row items-center mt-2 gap-1 rounded-md p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white"
                >
                    <Zap
                        strokeWidth="1.5"
                        class="stroke-yellow-500 fill-yellow-500 w-5 h-5"
                        size="20"
                    />
                    Zap this list
                </button>
            </form>
        {:else}
            Please sign in to zap.
        {/if}
    </div>
</Popover>
