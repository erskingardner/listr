<script lang="ts">
    import { Avatar } from 'flowbite-svelte';
    import ndk from '$lib/stores/ndk';

    export let npub: string;

    const person = $ndk.getUser({ npub: npub });
</script>

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
            <Avatar src={person.profile?.image} size="lg" class="!m-0" />
        </div>
        <div class="block md:hidden">
            <Avatar src={person.profile?.image} size="md" class="!m-0" />
        </div>
        <span class="text-lg md:text-2xl no-underline"
            >{person.profile?.displayName || person.profile?.name}</span
        >
    </a>
{:catch error}
    Broken 🙈
{/await}
