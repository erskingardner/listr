<script lang="ts">
import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { LogIn } from "lucide-svelte";
import toast from "svelte-hot-french-toast";
import ndk from "$lib/stores/ndk.svelte";

let { buttonClass = "" }: { buttonClass?: string } = $props();

async function handleSignin() {
    try {
        const signer = new NDKNip07Signer();
        await ndk.$sessions.login(signer);
        toast.success("Signed in successfully");
    } catch (error) {
        console.error("Sign in failed:", error);
        toast.error("Sign in failed. Make sure you have a Nostr browser extension installed.");
    }
}
</script>

<div class="relative">
    <button
        onclick={handleSignin}
        class="flex gap-2 items-center whitespace-nowrap shrink rounded-md px-2 py-1 text-sm font-semibold leading-6 text-gray-50 bg-indigo-600 hover:bg-indigo-500 hover:text-white {buttonClass}"
    >
        <LogIn strokeWidth="1.5" size="20" />
        Sign in
    </button>
</div>
