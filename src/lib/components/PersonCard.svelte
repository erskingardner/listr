<script lang="ts">
    import { Avatar } from 'flowbite-svelte';
    import UserInterface from '$lib/interfaces/users';

    export let npub: string;
    const user = UserInterface.get({ npub: npub });
</script>

{#key $user}
    {#if $user}
        <a
            href={`/${npub}`}
            class="border border-stone-800/20 dark:border-stone-100/20 p-2 rounded-md
    flex flex-row gap-4 items-center no-underline"
        >
            <div class="hidden md:block">
                <Avatar src={$user.image} size="lg" class="!m-0 object-cover" />
            </div>
            <div class="block md:hidden">
                <Avatar src={$user.image} size="md" class="!m-0 object-cover" />
            </div>
            <span class="text-lg md:text-2xl no-underline">{$user.displayName || $user.name}</span>
        </a>
    {:else}
        <div
            class="border border-stone-800/20 dark:border-stone-100/20
        p-2 rounded-md items-center no-underline
        animate-pulse"
        >
            <div class="text-center">Loading...</div>
        </div>
    {/if}
{/key}
<!--
{#await person.fetchProfile()}
    <div
        class="border border-stone-800/20 dark:border-stone-100/20
        p-2 rounded-md items-center no-underline
        animate-pulse"
    >
        <div class="text-center">Loading...</div>
    </div>
{:then value}
    <a
        href={`/${npub}`}
        class="border border-stone-800/20 dark:border-stone-100/20 p-2 rounded-md
flex flex-row gap-4 items-center no-underline"
    >
        <div class="hidden md:block">
            <Avatar src={$user.image} size="lg" class="!m-0 object-cover" />
        </div>
        <div class="block md:hidden">
            <Avatar src={$user.image} size="md" class="!m-0 object-cover" />
        </div>
        <span class="text-lg md:text-2xl no-underline">{$user.displayName || $user.name}</span>
    </a>
{:catch error}
    Broken 🙈
{/await} -->
