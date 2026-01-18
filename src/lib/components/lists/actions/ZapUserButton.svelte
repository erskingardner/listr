<script lang="ts">
import {
    type LnPaymentInfo,
    NDKNip07Signer,
    type NDKPaymentConfirmationLN,
    type NDKUser,
    type NDKUserProfile,
    type NDKZapDetails,
    NDKZapper,
} from "@nostr-dev-kit/ndk";
import { Popover } from "flowbite-svelte";
import { Zap } from "lucide-svelte";
import toast from "svelte-hot-french-toast";
import { requestProvider } from "webln";
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte";

let { user, extraClasses }: { user: NDKUser; extraClasses?: string } = $props();

let currentUser = $derived(getCurrentUser());
let profile: NDKUserProfile | null = $state(null);
let amount = $state(21);
let comment: string = $state("");
let popoverOpen = $state(false);

$effect(() => {
    if (!profile) {
        user.fetchProfile().then((fetchedProfile) => {
            profile = fetchedProfile;
        });
    }
});

async function submitZap(e: SubmitEvent) {
    e.preventDefault();
    const signer = new NDKNip07Signer();
    ndk.signer = signer;

    const zapper = new NDKZapper(user, amount * 1000, "msat", {
        comment,
        ndk,
        signer,
        lnPay: async (payment: NDKZapDetails<LnPaymentInfo>) => {
            try {
                const webln = await requestProvider();
                const response = await webln.sendPayment(payment.pr);
                return { preimage: response.preimage } as NDKPaymentConfirmationLN;
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        onComplete: (results) => {
            let hasError = false;
            results.forEach((result) => {
                if (result instanceof Error) {
                    hasError = true;
                }
            });

            if (hasError) {
                toast.error("Zap failed. Please try again.");
            } else {
                toast.success("Zap successful!");
                popoverOpen = false;
            }
        },
    });

    try {
        await zapper.zap();
    } catch (error) {
        console.log(error);
        toast.error("Zap failed. Please try again.");
    }
}

let displayableName = $derived.by(() => {
    if (profile || user) {
        return (
            profile?.displayName ||
            profile?.name ||
            profile?.nip05 ||
            `${user?.npub.slice(0, 9)}...`
        );
    }
    return "";
});
</script>

<button onclick={() => (popoverOpen = true)} class={extraClasses}>
    <Zap size="20" strokeWidth="1.5" class="w-5 h-5" />
    Zap
</button>
<Popover
    bind:isOpen={popoverOpen}
    trigger="click"
    placement="left"
    class="dark:text-gray-50 dark:bg-gray-700"
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
                    class="w-full flex flex-row items-center mt-2 gap-1 rounded-md p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white"
                >
                    <Zap
                        strokeWidth="1.5"
                        class="stroke-yellow-500 fill-yellow-500 w-5 h-5"
                        size="20"
                    />
                    Zap {displayableName}
                </button>
            </form>
        {:else}
            Please sign in to zap.
        {/if}
    </div>
</Popover>
