<script lang="ts">
    import UserInterface from '$lib/interfaces/users';
    import { Avatar } from 'flowbite-svelte';

    export let npub: string;

    let person = UserInterface.get({ npub: npub });
</script>

{#if $person}
    <a
        href={`/${npub}`}
        class="border border-stone-800/20 dark:border-stone-100/20 p-2 rounded-md
        flex flex-row gap-4 items-center no-underline"
    >
        <div class="hidden md:block">
            <Avatar src={$person.image} size="lg" class="!m-0" />
        </div>
        <div class="block md:hidden">
            <Avatar src={$person.image} size="md" class="!m-0" />
        </div>
        <span class="text-lg md:text-2xl no-underline">{$person.displayName || $person.name}</span>
    </a>
{/if}
