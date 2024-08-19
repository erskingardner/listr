<script lang="ts">
    import { fly, fade } from "svelte/transition";
    import { quintInOut } from "svelte/easing";

    export let visible: boolean;

    function toggleVisible() {
        visible = !visible;
    }
</script>

{#if visible}
    <!-- Overlay -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
        transition:fade={{ duration: 50 }}
        role="region"
        tabindex="-1"
        on:click={toggleVisible}
        class="fixed bg-black/40 z-40 top-0 left-0 w-full h-full"
    />

    <!-- Drawer -->

    <div
        in:fly={{ duration: 300, x: 320, easing: quintInOut }}
        out:fly={{ duration: 100, x: 320, easing: quintInOut }}
        class="fixed top-0 z-50 h-full p-4 right-0 w-72 shadow-3xl border-l dark:border-gray-950 dark:bg-gray-800"
    >
        <slot />
    </div>
{/if}
