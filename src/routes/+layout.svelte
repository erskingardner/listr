<script lang="ts">
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import { onMount } from 'svelte';
    import { currentUser } from '$lib/stores/currentUser';
    // import { dev } from '$app/environment';
    // import { inject } from '@vercel/analytics';
    // inject({ mode: dev ? 'development' : 'production' });

    let savestore = false;

    $: if (savestore && $currentUser) {
        window.sessionStorage.setItem('listrCurrentUser', JSON.stringify($currentUser));
    }

    onMount(async () => {
        const storedUser = window.sessionStorage.getItem('listrCurrentUser');
        if (storedUser) currentUser.set(JSON.parse(storedUser));
        savestore = true;
    });
</script>

<main class="p-8 max-w-5xl mx-auto">
    <Header />
    <slot />
    <Footer />
</main>
