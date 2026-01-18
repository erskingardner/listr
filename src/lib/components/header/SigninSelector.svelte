<script lang="ts">
import { LogIn } from "lucide-svelte";
import ndk from "$lib/stores/ndk.svelte";
import { SigninMethod, signin } from "$lib/utils/auth";

let { buttonClass = "" }: { buttonClass?: string } = $props();
</script>

<div class="relative">
    <button
        onclick={() => signin(ndk, undefined, SigninMethod.Nip07)}
        class="flex gap-2 items-center whitespace-nowrap shrink rounded-md px-2 py-1 text-sm font-semibold leading-6 text-gray-50 bg-indigo-600 hover:bg-indigo-500 hover:text-white {buttonClass}"
    >
        <LogIn strokeWidth="1.5" size="20" />
        Sign in
    </button>
</div>
