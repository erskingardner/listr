<script lang="ts">
    import { LogIn } from "lucide-svelte";
    import { SigninMethod, signin } from "$lib/utils/auth";
    import ndk from "$lib/stores/ndk";
    export let buttonClass: string = "";
</script>

<div class="relative">
    <button
        on:click={() => signin($ndk, undefined, SigninMethod.Nip07)}
        class="flex gap-2 items-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-semibold leading-6 text-gray-50 bg-indigo-600 hover:bg-indigo-500 hover:text-white {buttonClass}"
    >
        <LogIn strokeWidth="1.5" size="20" />
        Sign in
    </button>
</div>
