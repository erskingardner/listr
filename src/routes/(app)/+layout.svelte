<script lang="ts">
import "../../app.css";
import { Toaster } from "svelte-hot-french-toast";
import DonateModal from "$lib/components/DonateModal.svelte";
import Header from "$lib/components/header/Header.svelte";
import DesktopMenu from "$lib/components/sidebar/DesktopMenu.svelte";
import MobileMenu from "$lib/components/sidebar/MobileMenu.svelte";

let { children } = $props();

let mobileMenuVisible = $state(false);
let donateModal = $state(false);

function toggleMobileMenu() {
    mobileMenuVisible = !mobileMenuVisible;
}
</script>

<Toaster />

<MobileMenu
    {mobileMenuVisible}
    closeMobileMenu={toggleMobileMenu}
    donateButtonClicked={() => (donateModal = true)}
/>
<DesktopMenu donateButtonClicked={() => (donateModal = true)} />
<div class="lg:pl-72 overflow-x-hidden">
    <Header openMobileMenu={toggleMobileMenu} />
    <main class="py-4 sm:py-6 lg:py-10">
        <div class="px-4 sm:px-6 lg:px-8">
            {@render children()}
        </div>
    </main>
</div>

<DonateModal bind:modalOpen={donateModal} />
