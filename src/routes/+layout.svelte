<script lang="ts">
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import { onMount } from 'svelte';
    import { currentUser } from '$lib/stores/currentUser';
    import ndk from '$lib/stores/ndk';

    let savestore = false;

    $: if (savestore && $currentUser) {
        window.sessionStorage.setItem('listrCurrentUser', JSON.stringify($currentUser));
    }

    onMount(async () => {
        const storedUser = window.sessionStorage.getItem('listrCurrentUser');
        if (storedUser) currentUser.set(JSON.parse(storedUser));
        savestore = true;
        await $ndk.connect();
    });
</script>

<main class="p-8 max-w-5xl mx-auto">
    <Header />
    <slot />
    <Footer />
</main>
