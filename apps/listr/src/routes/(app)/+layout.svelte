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
    import DonateModal from "$lib/components/DonateModal.svelte";
    import NoSignerModal from "$lib/components/NoSignerModal.svelte";

    export let data: LayoutServerData;

    let mobileMenuVisible: boolean = false;

    function toggleMobileMenu() {
        mobileMenuVisible = !mobileMenuVisible;
    }

    let signerModal = false;
    let donateModal = false;

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

<MobileMenu
    {mobileMenuVisible}
    on:closeMobileMenu={toggleMobileMenu}
    on:signin={signin}
    on:donateButtonClicked={() => (donateModal = true)}
/>
<DesktopMenu on:signin={signin} on:donateButtonClicked={() => (donateModal = true)} />
<div class="lg:pl-72">
    <Header on:openMobileMenu={toggleMobileMenu} on:signout={signout} on:signin={signin} />
    <main class="py-4 sm:py-6 lg:py-10">
        <div class="px-4 sm:px-6 lg:px-8">
            <slot />
        </div>
    </main>
</div>

<DonateModal bind:modalOpen={donateModal} />
<NoSignerModal bind:modalOpen={signerModal} />
