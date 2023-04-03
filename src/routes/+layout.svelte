<script lang="ts">
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import { onMount } from 'svelte';
    import { currentUserPubkey, currentUserProfile } from '$lib/stores/currentUser';
    import { settings } from '$lib/stores/settings';
    import { browser } from '$app/environment';

    onMount(async () => {
        const pubkey = localStorage.getItem('listrCurrentUserPubkey');
        const storedProfileMetadata = localStorage.getItem('listrCurrentUserProfile');
        const storedSettings = localStorage.getItem('listrSettings');
        if (pubkey) currentUserPubkey.set(pubkey);
        if (storedProfileMetadata) currentUserProfile.set(JSON.parse(storedProfileMetadata));
        if (storedSettings) settings.set(JSON.parse(storedSettings));
    });

    $: {
        // Set the theme class on the html element
        if (browser) {
            const htmlElem = document.documentElement;
            const otherTheme = $settings.theme === 'dark' ? 'light' : 'dark';
            htmlElem?.classList.add($settings.theme);
            htmlElem?.classList.remove(otherTheme);
        }
    }
</script>

<main class="p-8 max-w-5xl mx-auto">
    <Header />
    <slot />
</main>
