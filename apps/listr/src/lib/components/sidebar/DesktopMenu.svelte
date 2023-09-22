<script lang="ts">
    import Logo from "./Logo.svelte";
    import NavMenu from "./NavMenu.svelte";
</script>

<!-- Static sidebar for desktop -->
<div class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center">
            <Logo />
        </div>
        <NavMenu on:signin />
    </div>
</div>
