<script lang="ts">
    import { expoInOut } from "svelte/easing";
    import { scale } from "svelte/transition";
    import { LogIn } from "lucide-svelte";
    import { SigninMethod, signin } from "$lib/utils/auth";
    import ndk, { bunkerNdk } from "$lib/stores/ndk";
    import RemoteSignerModal from "../RemoteSignerModal.svelte";

    export let buttonClass: string = "";
    export let dropdownClass: string = "";

    let signinVisible: boolean = false;
    let remoteSignerModal: boolean = false;

    function toggleSigninMenu() {
        signinVisible = !signinVisible;
    }

    async function signinOrConnectBunker() {
        const storedKey = localStorage.getItem("listrNip46LocalSignerPK");
        const targetNpub = localStorage.getItem("listrNip46TargetNpub");
        if (storedKey && targetNpub) {
            signin($ndk, $bunkerNdk!, SigninMethod.Nip46);
        } else {
            remoteSignerModal = true;
        }
    }
</script>

<div class="relative">
    <button
        on:click={toggleSigninMenu}
        class="flex gap-2 items-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-semibold leading-6 text-gray-50 bg-indigo-600 hover:bg-indigo-500 hover:text-white {buttonClass}"
    >
        <LogIn strokeWidth="1.5" size="20" />
        Sign in
    </button>

    {#if signinVisible}
        <div
            on:pointerleave={toggleSigninMenu}
            in:scale={{ duration: 100, easing: expoInOut, start: 0.95 }}
            out:scale={{ duration: 75, easing: expoInOut, start: 0.95 }}
            class="absolute flex flex-col gap-2 right-0 z-10 mt-2.5 origin-top-right rounded-md bg-white dark:bg-gray-700 dark:text-gray-50 py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none {dropdownClass}"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabindex="-1"
        >
            <button
                on:click={() => signin($ndk, undefined, SigninMethod.Nip07)}
                on:touchend={() => signin($ndk, undefined, SigninMethod.Nip07)}
                class="block w-full text-left px-3 py-1 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-600"
                role="menuitem"
                tabindex="-1"
                id="user-menu-item-1"
            >
                Sign in with extension
            </button>
            <button
                on:click={signinOrConnectBunker}
                on:touchend={signinOrConnectBunker}
                class="block w-full text-left px-3 py-1 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-600"
                role="menuitem"
                tabindex="-1"
                id="user-menu-item-1"
            >
                Sign in with nsecBunker
            </button>
        </div>
    {/if}
</div>

<RemoteSignerModal bind:modalOpen={remoteSignerModal} />
