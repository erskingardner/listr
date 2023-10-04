<script lang="ts">
    import { type NDKUser, NDKNip07Signer } from "@nostr-dev-kit/ndk";
    import { Zap } from "lucide-svelte";
    import { Popover } from "flowbite-svelte";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { requestProvider } from "webln";
    import toast from "svelte-french-toast";

    export let user: NDKUser;

    let amount: number = 21;
    let comment: string;

    let popoverOpen: boolean = false;

    async function submitZap() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        let zapRequest = await user.zap(amount * 1000, comment);

        if (!zapRequest) {
            console.log("No payment request");
            return;
        }

        try {
            const webln = await requestProvider();
            webln
                .sendPayment(zapRequest)
                .then(() => {
                    toast.success("Zap successful!");
                    popoverOpen = false;
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Zap failed. Please try again.");
                });
        } catch (error: any) {
            console.log(error);
        }
    }

    const displayableName =
        user.profile?.displayName ||
        user.profile?.name ||
        user.profile?.nip05 ||
        `${user.npub.slice(0, 9)}...`;
</script>

<button on:click={() => (popoverOpen = true)} class={$$props.class}>
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
                    Zap {displayableName}
                </button>
            </form>
        {:else}
            Please sign in to zap.
        {/if}
    </div>
</Popover>
