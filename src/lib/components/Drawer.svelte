<script lang="ts">
import { type Snippet } from "svelte";
import { quintInOut } from "svelte/easing";
import { fade, fly } from "svelte/transition";

let { visible, children }: { visible: boolean; children: Snippet } = $props();

function toggleVisible() {
    visible = !visible;
}
</script>

{#if visible}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        transition:fade={{ duration: 50 }}
        role="region"
        tabindex="-1"
        onclick={toggleVisible}
        class="fixed bg-black/40 z-40 top-0 left-0 w-full h-full"
    ></div>

    <!-- Drawer -->

    <div
        in:fly={{ duration: 300, x: 320, easing: quintInOut }}
        out:fly={{ duration: 100, x: 320, easing: quintInOut }}
        class="fixed top-0 z-50 h-full p-4 right-0 w-72 shadow-3xl border-l dark:border-gray-950 dark:bg-gray-800"
    >
        {@render children()}
    </div>
{/if}
