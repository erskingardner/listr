<script lang="ts">
    import { DarkMode } from "flowbite-svelte";
    import { SunMoon } from "lucide-svelte";
    import Logo from "./Logo.svelte";
    import NavMenu from "./NavMenu.svelte";
</script>

<!-- Static sidebar for desktop -->
<div class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-300 dark:bg-gray-900 px-6">
        <div class="flex h-16 shrink-0 items-center justify-between">
            <a href="/" class="flex h-16 shrink-0 items-center">
                <span class="sr-only">Listr</span>
                <Logo />
            </a>
            <DarkMode btnClass="text:black dark:text-white hover:text-gray-500">
                <svelte:fragment slot="lightIcon">
                    <SunMoon strokeWidth="1.5" size="24" />
                </svelte:fragment>
                <svelte:fragment slot="darkIcon">
                    <SunMoon strokeWidth="1.5" size="24" />
                </svelte:fragment>
            </DarkMode>
        </div>
        <NavMenu on:signin />
    </div>
</div>
