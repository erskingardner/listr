<script lang="ts">
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import { onMount } from 'svelte';
    import { currentUser } from '$lib/stores/currentUser';
    import { getFlash } from 'sveltekit-flash-message/client';
    import { page } from '$app/stores';
    import { dev } from '$app/environment';
    import { inject } from '@vercel/analytics';
    import { fade } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    import { dateTomorrow } from '$lib/utils/helpers';
    import ndk from '$lib/stores/ndk';
    import { currentUserFollows } from '$lib/stores/currentUserFollows';
    import NDK from '@nostr-dev-kit/ndk';
    import ndkStore from '$lib/stores/ndk';
    inject({ mode: dev ? 'development' : 'production' });

    const flash = getFlash(page);

    let savestore = false;

    $: if (savestore && $currentUser) {
        // Get the user
        window.sessionStorage.setItem('listrCurrentUser', JSON.stringify($currentUser));
        $ndk.getUser({ npub: $currentUser.npub })
            .follows()
            .then((userSet) => {
                currentUserFollows.set(Array.from(userSet).map((user) => user.hexpubkey()));
            });
    }

    $: if ($currentUser?.relayUrls) {
        console.log('Updating NDK relays for logged in user');
        const newNdk = new NDK({ explicitRelayUrls: $currentUser.relayUrls });
        ndkStore.set(newNdk);
    }

    onMount(async () => {
        const storedUser = window.sessionStorage.getItem('listrCurrentUser');
        if (storedUser) {
            currentUser.set(JSON.parse(storedUser));
            document.cookie = `userNpub=${
                $currentUser?.npub
            }; expires=${dateTomorrow()}; SameSite=Lax; Secure`;
        }
        savestore = true;
    });

    // Hide the flash after an amount of time
    $: {
        if ($flash) {
            setTimeout(() => {
                $flash = undefined;
            }, 3000);
        }
    }
</script>

<main class="p-8 max-w-5xl mx-auto relative">
    {#if $flash}
        <div
            class={`${
                $flash.type === 'success'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-red-500/20 text-red-500'
            } flashMessage`}
            transition:fade={{ duration: 1000, easing: circInOut }}
        >
            {$flash.message}
        </div>
    {/if}
    <Header />
    <slot />
    <Footer />
</main>
