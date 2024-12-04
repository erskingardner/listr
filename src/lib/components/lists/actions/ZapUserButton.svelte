<script lang="ts">
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte";
import { NDKNip07Signer, type NDKUser, type NDKUserProfile } from "@nostr-dev-kit/ndk";
import { Popover } from "flowbite-svelte";
import { Zap } from "lucide-svelte";
import { decrypt } from "nostr-tools/nip04";
import toast from "svelte-hot-french-toast";
import { requestProvider } from "webln";

let { user, extraClasses }: { user: NDKUser; extraClasses?: string } = $props();

let currentUser = getCurrentUser();
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
    let zapRequest = await user.zap(amount * 1000, comment);

    if (!zapRequest) {
        console.log("No payment request");
        return;
    }

    try {
        const webln = await requestProvider();
        webln
            .sendPayment(zapRequest as string)
            .then(() => {
                toast.success("Zap successful!");
                popoverOpen = false;
            })
            .catch((err) => {
                console.error(err);
                toast.error("Zap failed. Please try again.");
            });
    } catch (e) {
        console.log(e);
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
    bind:open={popoverOpen}
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
