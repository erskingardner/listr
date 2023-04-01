<script lang="ts">
    import ListBullet from '../icons/ListBullet.svg.svelte';
    import ProfileMenu from './ProfileMenu.svelte';
</script>

<div class="header flex flex-row mb-10 items-center">
    <a
        href="/"
        class="logo flex flex-row items-center hover:text-stone-700 hover:dark:text-stone-300"
    >
        <ListBullet iconClass="w-8 h-8" />
        <div class="logoText text-4xl font-bold font-cursive">Listr</div>
    </a>
    <ProfileMenu />
</div>
