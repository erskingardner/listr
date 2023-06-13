<script lang="ts">
    import ZapIcon from '$lib/elements/icons/Zap.svelte';
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import type List from '$lib/classes/list';
    import ndk from '$lib/stores/ndk';
    import { NDKNip07Signer, NDKEvent, type NDKZapInvoice } from '@nostr-dev-kit/ndk';
    import { requestProvider } from 'webln';
    import { zapInvoiceFromEvent } from '@nostr-dev-kit/ndk';

    export let list: List;
    let amount: number = 402;
    let comment: string = '';

    let zaps: NDKZapInvoice[] = [];
    let totalZaps = 0;

    const zapsSub = $ndk.subscribe(
        { kinds: [9735], '#a': [list.id as string] },
        { closeOnEose: false }
    );

    zapsSub.on('event', (event) => {
        const zapInvoice = zapInvoiceFromEvent(event);
        if (zapInvoice) {
            zaps.push(zapInvoice as NDKZapInvoice);
            totalZaps += zapInvoice.amount / 1000;
        }
    });

    async function submitZap() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        ndk.set($ndk);
        const event = await $ndk.fetchEvent(list.nip19 as string);
        let zapRequest = await event?.zap(amount * 1000, comment);

        if (!zapRequest) {
            console.log('No payment request');
            return;
        }

        try {
            const webln = await requestProvider();
            const res = await webln.sendPayment(zapRequest);
        } catch (error: any) {
            console.log(error);
        }
    }
</script>

<Popover style="position: relative;" class="zapPopoverWrapper {$$props.class}">
    <PopoverButton class="flex flex-row gap-1 hover:text-zinc-700 hover:dark:text-zinc-400">
        <ZapIcon class="w-4 h-4 md:h-6 md:w-6" />
        {#if totalZaps}
            {totalZaps}
        {/if}
    </PopoverButton>

    <PopoverPanel
        let:close
        style="position: absolute; z-index: 10;"
        class="
            w-64 right-0 flex flex-col
            bg-zinc-100 dark:bg-zinc-900
            p-4 rounded-lg shadow-md
            border border-zinc-200 dark:border-zinc-800
        "
    >
        <div class="panel-contents flex flex-col gap-2">
            <form
                on:submit|preventDefault={async () => {
                    submitZap();
                    close();
                }}
                class="flex flex-col gap-4 justify-start items-start"
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
                <button type="submit" class="primaryButton">Zap this list ⚡</button>
            </form>
        </div>
    </PopoverPanel>
</Popover>
