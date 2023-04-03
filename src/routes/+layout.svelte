<script lang="ts">
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import { onMount } from 'svelte';
    import { currentUser, currentUserProfile } from '$lib/stores/currentUser';
    import ndk from '$lib/stores/ndk';
    import { settings } from '$lib/stores/settings';
    import { browser } from '$app/environment';

    onMount(async () => {
        const storedUser = localStorage.getItem('listrCurrentUser');
        const storedUserProfile = localStorage.getItem('listrCurrentUserProfile');
        const storedSettings = localStorage.getItem('listrSettings');
        if (storedUser) currentUser.set(JSON.parse(storedUser));
        if (storedUserProfile) currentUserProfile.set(JSON.parse(storedUserProfile));
        if (storedSettings) settings.set(JSON.parse(storedSettings));

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
</main>
