<script lang="ts">
    import { X } from "lucide-svelte";
    import Logo from "./Logo.svelte";
    import NavMenu from "./NavMenu.svelte";
    import { fade, fly } from "svelte/transition";
    import { expoInOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let mobileMenuVisible: boolean;
</script>

{#if mobileMenuVisible}
    <!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. -->
    <div class="relative z-50 lg:hidden" role="dialog" aria-modal="true">
        <!-- Off-canvas menu backdrop -->
        <div
            transition:fade={{ duration: 300, easing: expoInOut }}
            class="fixed inset-0 bg-gray-900/80"
        ></div>

        <div class="fixed inset-0 flex">
            <div
                transition:fly={{ x: "-100vw", duration: 300, easing: expoInOut }}
                class="relative mr-16 flex w-full max-w-xs flex-1"
            >
                <div
                    transition:fade={{ duration: 300, easing: expoInOut }}
                    class="absolute left-full top-0 flex w-16 justify-center pt-5"
                >
                    <button
                        type="button"
                        on:click={() => dispatch("closeMobileMenu")}
                        class="-m-2.5 p-2.5"
                    >
                        <span class="sr-only">Close sidebar</span>
                        <X color="white" />
                    </button>
                </div>

                <!-- Sidebar component -->
                <div
                    class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10"
                >
                    <div class="flex h-16 shrink-0 items-center">
                        <Logo />
                    </div>
                    <NavMenu on:signin />
                </div>
            </div>
        </div>
    </div>
{/if}
