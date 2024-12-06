<script lang="ts">
import "../../app.css";
import { browser } from "$app/environment";
import DonateModal from "$lib/components/DonateModal.svelte";
import Header from "$lib/components/header/Header.svelte";
import DesktopMenu from "$lib/components/sidebar/DesktopMenu.svelte";
import MobileMenu from "$lib/components/sidebar/MobileMenu.svelte";
import { setCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte";
import { SigninMethod, signin, signout } from "$lib/utils/auth";
import { onMount } from "svelte";
import { Toaster } from "svelte-hot-french-toast";

let { data, children } = $props();

let mobileMenuVisible = $state(false);
let donateModal = $state(false);

function toggleMobileMenu() {
    mobileMenuVisible = !mobileMenuVisible;
}

if (data.listrCookie) {
    setCurrentUser(data.listrCookie);
}

onMount(() => {
    if (!window.nostr) {
        import("nostr-login")
            .then(async ({ init }) => {
                init({
                    onAuth(npub, options) {
                        if (options.type === "logout") {
                            signout(ndk);
                        } else {
                            let user = ndk.getUser({ npub });
                            signin(ndk, undefined, SigninMethod.NostrLogin, undefined, user);
                        }
                    },
                });
            })
            .catch((error) => console.log("Failed to load nostr-login", error));
    }
});
</script>

<Toaster />

<MobileMenu
    {mobileMenuVisible}
    closeMobileMenu={toggleMobileMenu}
    donateButtonClicked={() => (donateModal = true)}
/>
<DesktopMenu donateButtonClicked={() => (donateModal = true)} />
<div class="lg:pl-72">
    <Header openMobileMenu={toggleMobileMenu} />
    <main class="py-4 sm:py-6 lg:py-10">
        <div class="px-4 sm:px-6 lg:px-8">
            {@render children()}
        </div>
    </main>
</div>

<DonateModal bind:modalOpen={donateModal} />
