<script lang="ts">
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import { onMount } from 'svelte';
    import { currentUser } from '$lib/stores/currentUser';
    import { initFlash } from 'sveltekit-flash-message/client';
    import { page } from '$app/stores';
    import { dev } from '$app/environment';
    import { inject } from '@vercel/analytics';
    import { fade } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    import { dateTomorrow } from '$lib/utils/helpers';
    inject({ mode: dev ? 'development' : 'production' });

    const flash = initFlash(page);

    let savestore = false;

    $: if (savestore && $currentUser) {
        window.sessionStorage.setItem('listrCurrentUser', JSON.stringify($currentUser));
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
