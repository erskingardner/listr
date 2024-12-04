<script lang="ts">
import ndk from "$lib/stores/ndk.svelte";
import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { Modal } from "flowbite-svelte";
import { Zap } from "lucide-svelte";
import toast from "svelte-hot-french-toast";
import { requestProvider } from "webln";

const listrUser = ndk.getUser({
    npub: "npub1lstr2kmdthkgfuzne8e4cn2nhr646x8jt25szdj7t4wr6xemtuuq3lczsj",
});

let amount = 21000;
let comment: string;

export let modalOpen: boolean;

async function submitZap() {
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    let zapRequest = await listrUser.zap(amount * 1000, comment);

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
                modalOpen = false;
            })
            .catch((err) => {
                console.error(err);
                toast.error("Zap failed. Please try again.");
            });
    } catch (error) {
        console.log(error);
    }
}
</script>

<Modal
    title="⚡ Thanks for supporting Listr"
    bind:open={modalOpen}
    autoclose={false}
    outsideclose={true}
    placement="top-center"
    class="w-96"
    backdropClass="fixed inset-0 z-40 bg-black/60"
>
    <div class="p-4">
        <form
            on:submit|preventDefault={submitZap}
            class="flex flex-col gap-2 justify-start items-start"
        >
            <label for="amount" class="w-full"
                >Amount *
                <input
                    type="text"
                    bind:value={amount}
                    name="amount"
                    class="rounded-md bg-transparent w-full text-sm"
                    required
                />
            </label>
            <label for="comment" class="w-full"
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
                class="w-full justify-center flex flex-row items-center mt-2 gap-1 rounded-md p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white"
            >
                <Zap
                    strokeWidth="1.5"
                    class="stroke-yellow-500 fill-yellow-500 w-5 h-5"
                    size="20"
                />
                Zap Listr
            </button>
        </form>
    </div>
</Modal>
