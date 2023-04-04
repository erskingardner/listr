<script lang="ts">
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import { onMount } from 'svelte';
    import { currentUser, currentUserProfile } from '$lib/stores/currentUser';
    import { settings } from '$lib/stores/settings';
    import ndk from '$lib/stores/ndk';
    import { browser } from '$app/environment';

    let savestore = false;

    $: if (savestore && $currentUser) {
        window.sessionStorage.setItem('listrCurrentUser', JSON.stringify($currentUser));
    }

    $: if (savestore && $currentUserProfile) {
        window.sessionStorage.setItem(
            'listrCurrentUserProfile',
            JSON.stringify($currentUserProfile)
        );
    }

    $: if (savestore && $settings) {
        window.sessionStorage.setItem('listrSettings', JSON.stringify($settings));
    }

    onMount(async () => {
        const storedUser = window.sessionStorage.getItem('listrCurrentUser');
        const storedUserProfile = window.sessionStorage.getItem('listrCurrentUserProfile');
        const storedSettings = window.sessionStorage.getItem('listrSettings');
        if (storedUser) currentUser.set(JSON.parse(storedUser));
        if (storedUserProfile) currentUserProfile.set(JSON.parse(storedUserProfile));
        if (storedSettings) settings.set(JSON.parse(storedSettings));

        savestore = true;

        await $ndk.connect();
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
    <Footer />
</main>
