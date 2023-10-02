<script lang="ts">
    import "../../app.css";
    import MobileMenu from "$lib/components/sidebar/MobileMenu.svelte";
    import DesktopMenu from "$lib/components/sidebar/DesktopMenu.svelte";
    import Header from "$lib/components/header/Header.svelte";
    import toast, { Toaster } from "svelte-french-toast";
    import { type NDKUser, NDKNip07Signer } from "@nostr-dev-kit/ndk";
    import { Modal } from "flowbite-svelte";
    import { PlausibleAnalytics, pa } from "@accuser/svelte-plausible-analytics";
    import currentUser from "$lib/stores/currentUser";
    import {
        currentUserFollows,
        currentUserSettings,
        fetchUserSettings,
        fetchUserFollows,
    } from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import type { LayoutServerData } from "../$types";
    import { browser } from "$app/environment";

    export let data: LayoutServerData;

    let mobileMenuVisible: boolean = false;

    function toggleMobileMenu() {
        mobileMenuVisible = !mobileMenuVisible;
    }

    let signerModal = false;

    if (data.listrCookie) {
        $currentUser = $ndk.getUser({ npub: data.listrCookie });
        $currentUser.ndk = $ndk;
    }

    async function signin(domEvent: CustomEvent) {
        try {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
            signer.user().then(async (ndkUser: NDKUser) => {
                if (ndkUser.npub) {
                    $currentUser = ndkUser;
                    $currentUser.ndk = $ndk;
                    $currentUserFollows = await fetchUserFollows($currentUser);
                    $currentUserSettings = await fetchUserSettings($currentUser);
                    document.cookie = `listrUserNpub=${ndkUser.npub};
                    max-age=max-age-in-seconds=1209600; SameSite=Lax; Secure`;
                    if (window.plausible) pa.addEvent("Log in");
                    toast.success("Signed in");
                }
            });
            if (domEvent?.detail?.redirect) {
                goto(domEvent.detail.redirect);
            } else {
                goto($page.url.pathname);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error.message);
            signerModal = true;
        }
    }

    function signout() {
        currentUser.set(null);
        currentUserFollows.set([]);
        document.cookie = "listrUserNpub=";
        if (window.plausible) pa.addEvent("Log out");
        toast.success("Signed out");
        goto("/");
    }

    if (browser) {
        document.body.classList.remove("bg-gray-900");
        document.body.classList.remove("dark:bg-gray-900");
    }

    $: {
        if ($currentUser && $currentUserFollows.length === 0) {
            fetchUserFollows($currentUser).then((follows) => ($currentUserFollows = follows));
        }
    }

    $: {
        if ($currentUser && !$currentUserSettings && browser) {
            fetchUserSettings($currentUser).then((settings) => ($currentUserSettings = settings));
        }
    }
</script>

<PlausibleAnalytics apiHost="/stats" domain="listr.lol" />

<Toaster />

<MobileMenu {mobileMenuVisible} on:closeMobileMenu={toggleMobileMenu} on:signin={signin} />
<DesktopMenu on:signin={signin} />
<div class="lg:pl-72">
    <Header on:openMobileMenu={toggleMobileMenu} on:signout={signout} on:signin={signin} />
    <main class="py-4 sm:py-6 lg:py-10">
        <div class="px-4 sm:px-6 lg:px-8">
            <slot />
        </div>
    </main>
</div>

<Modal
    title="Nostr Signing Extension Not Found"
    bind:open={signerModal}
    autoclose
    outsideclose={true}
    class="relative flex p-2 mx-auto"
    backdropClass="fixed inset-0 z-40 bg-gray-900 bg-opacity-80"
>
    <p class="text-gray-900 dark:text-white mb-4">
        Listr is an app built on <span class="font-bold">Nostr</span>. To log in and manage your
        lists you need to sign events with your Nostr keys using a browser extension like Alby or
        nos2x in Chrome or Brave.
    </p>
    <p class="text-gray-900 dark:text-white mb-4">
        If you're unsure what Nostr is and want to learn more please check out <a
            href="https://nostr.how?utm_source=listr&utm_medium=signerModal">Nostr.how</a
        >
    </p>
    <svelte:fragment slot="footer">
        <div
            class="flex flex-col gap-8 md:flex-row items-center justify-center md:justify-around w-full"
        >
            <a
                href="https://getalby.com?utm_source=listr&utm_medium=signerModal"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0 whitespace-nowrap"
                target="_blank"
            >
                <span class="">Get Alby</span>
            </a>
            <a
                href="https://github.com/fiatjaf/nos2x"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0 whitespace-nowrap"
                target="_blank"
            >
                <span class="">Get nos2x</span>
            </a>
            <a
                href="https://nostr.how?utm_source=listr&utm_medium=signerModal"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0 whitespace-nowrap"
                target="_blank"
            >
                <span class="">Learn more</span>
            </a>
        </div>
    </svelte:fragment>
</Modal>
