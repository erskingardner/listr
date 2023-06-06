<script lang="ts">
    import { Avatar } from 'flowbite-svelte';
    import User from '$lib/classes/user';

    export let id: string;
    const user = User.get(id);

    // This is a gross hack to get back a real User instance, not a duck-typed pseudo-user.
    let realUser: User;
    $: if ($user) realUser = new User($user);
</script>

{#if realUser}
    <a
        href={`/${realUser.npub}`}
        class="border border-stone-800/20 dark:border-stone-100/20 p-2 rounded-md
flex flex-row gap-4 items-center no-underline"
    >
        <div class="hidden md:block">
            <Avatar src={realUser.image} size="lg" class="!m-0 object-cover" />
        </div>
        <div class="block md:hidden">
            <Avatar src={realUser.image} size="md" class="!m-0 object-cover" />
        </div>
        <span class="text-lg md:text-2xl no-underline">{realUser.displayableName()}</span>
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
