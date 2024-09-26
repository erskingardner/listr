<script lang="ts">
    import "../../app.css";
    import MobileMenu from "$lib/components/sidebar/MobileMenu.svelte";
    import DesktopMenu from "$lib/components/sidebar/DesktopMenu.svelte";
    import Header from "$lib/components/header/Header.svelte";
    import { Toaster } from "svelte-french-toast";
    import currentUser from "$lib/stores/currentUser";
    import {
        currentUserFollows,
        currentUserSettings,
        fetchUserSettings,
        fetchUserFollows,
    } from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
    import type { LayoutServerData } from "../$types";
    import { browser } from "$app/environment";
    import DonateModal from "$lib/components/DonateModal.svelte";
    import NoSignerModal from "$lib/components/NoSignerModal.svelte";

    export let data: LayoutServerData;

    let mobileMenuVisible: boolean = false;

    function toggleMobileMenu() {
        mobileMenuVisible = !mobileMenuVisible;
    }

    let signerModal: boolean = false;
    let donateModal: boolean = false;

    if (data.listrCookie) {
        $currentUser = $ndk.getUser({ npub: data.listrCookie });
        $currentUser.ndk = $ndk;
    }

    // Cleans up hack that fixes bg-color on the homepage
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

<Toaster />

<MobileMenu
    {mobileMenuVisible}
    on:closeMobileMenu={toggleMobileMenu}
    on:donateButtonClicked={() => (donateModal = true)}
/>
<DesktopMenu on:donateButtonClicked={() => (donateModal = true)} />
<div class="lg:pl-72">
    <Header on:openMobileMenu={toggleMobileMenu} />
    <main class="py-4 sm:py-6 lg:py-10">
        <div class="px-4 sm:px-6 lg:px-8">
            <slot />
        </div>
    </main>
</div>

<DonateModal bind:modalOpen={donateModal} />
<NoSignerModal bind:modalOpen={signerModal} />
