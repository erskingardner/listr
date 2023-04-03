<script lang="ts">
    import ListBulletIcon from '$lib/elements/icons/ListBullet.svg.svelte';
    import ProfileMenu from '$lib/components/ProfileMenu.svelte';
</script>

<div class="header flex flex-row mb-10 items-center">
    <a
        href="/"
        class="no-underline logo flex flex-row items-center hover:text-stone-700 hover:dark:text-stone-300"
    >
        <ListBulletIcon iconClass="w-8 h-8" />
        <div class="logoText text-4xl font-bold font-cursive">Listr</div>
    </a>
    <ProfileMenu />
</div>
