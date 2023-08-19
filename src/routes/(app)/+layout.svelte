<script lang="ts">
    import "../../app.css";
    import MobileMenu from "$lib/components/sidebar/MobileMenu.svelte";
    import DesktopMenu from "$lib/components/sidebar/DesktopMenu.svelte";
    import Header from "$lib/components/header/Header.svelte";
    import { browser } from "$app/environment";
    import toast, { Toaster } from "svelte-french-toast";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
    import { Modal } from "flowbite-svelte";
    import { PlausibleAnalytics } from "@accuser/svelte-plausible-analytics";
    import { pa } from "@accuser/svelte-plausible-analytics";
    import currentUser from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
    import { goto } from "$app/navigation";
    import { dateTomorrow } from "$lib/utils";

    let mobileMenuVisible: boolean = false;

    function toggleMobileMenu() {
        mobileMenuVisible = !mobileMenuVisible;
    }

    let userStored = false;
    let signerModal = false;

    if (browser) {
        const storedUser = window.sessionStorage.getItem("listrCurrentUser");
        if (storedUser) {
            currentUser.set(JSON.parse(storedUser));
            document.cookie = `userNpub=${
                $currentUser?.npub
            }; expires=${dateTomorrow()}; SameSite=Lax; Secure`;
        }
        userStored = true;
    }

    async function signin(domEvent: any) {
        try {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
            ndk.set($ndk);
            signer.user().then(async (ndkUser: NDKUser) => {
                if (!!ndkUser.npub) {
                    ndkUser.ndk = $ndk;
                    currentUser.set(ndkUser);
                    window.sessionStorage.setItem("listrCurrentUser", JSON.stringify(ndkUser));
                    document.cookie = `userNpub=${ndkUser.npub};
                expires=${dateTomorrow()}; SameSite=Lax; Secure`;
                    if (window.plausible) pa.addEvent("Log in");
                    toast.success("Logged in");
                }
            });
            if (domEvent?.detail?.redirect) goto(domEvent.detail.redirect);
        } catch (error: any) {
            console.error(error.message);
            signerModal = true;
        }
    }

    function signout(e: Event) {
        currentUser.set(undefined);
        window.sessionStorage.removeItem("listrCurrentUser");
        document.cookie = "userNpub=";
        if (window.plausible) pa.addEvent("Log out");
        goto("/");
    }
</script>

<PlausibleAnalytics apiHost="/stats" domain="listr.lol" />

<Toaster />

<MobileMenu {mobileMenuVisible} on:closeMobileMenu={toggleMobileMenu} on:signin={signin} />
<DesktopMenu on:signin={signin} />
<div class="lg:pl-72">
    <Header on:openMobileMenu={toggleMobileMenu} on:signout={signout} on:signin={signin} />
    <main class="py-10">
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
    class="relative flex p-2 mx-auto w-1/2"
>
    <p class="text-gray-900 mb-4">
        Listr is an app built on <span class="font-bold">Nostr</span>. To log in and manage your
        lists you need to sign events with your Nostr keys using a browser extension like Alby or
        nos2x in Chrome or Brave.
    </p>
    <p class="text-gray-900 mb-4">
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
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0"
                target="_blank"
            >
                <span class="">Get Alby</span>
            </a>
            <a
                href="https://github.com/fiatjaf/nos2x"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0"
                target="_blank"
            >
                <span class="">Get nos2x</span>
            </a>
            <a
                href="https://nostr.how?utm_source=listr&utm_medium=signerModal"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0"
                target="_blank"
            >
                <span class="">Learn more</span>
            </a>
        </div>
    </svelte:fragment>
</Modal>
