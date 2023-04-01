<script lang="ts">
    import '../app.css';
    import Header from '../components/Header.svelte';
</script>

<main class="p-8 max-w-5xl mx-auto">
    <Header />
    <slot />
</main>
