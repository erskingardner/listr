<script lang="ts">
    import ProfileMenu from '$lib/components/ProfileMenu.svelte';
    import SearchIcon from '$lib/elements/icons/Search.svelte';
    import XMarkIcon from '$lib/elements/icons/XMark.svelte';
    import ListrIcon from '$lib/elements/icons/Listr.svelte';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    import DonateButton from '$lib/components/DonateButton.svelte';

    let searchToastVisible: boolean = false;

    function searchSubmit(e: any) {
        const query: string = e.target.search.value;
        // There are two because of the mobile version of the search
        const searchInputs = document.querySelectorAll('input[type="text"].searchInput');
        const searchInputsArr: HTMLInputElement[] = Array.from(searchInputs) as HTMLInputElement[];
        const searchInput = searchInputsArr.filter((elem) => !!elem.value)[0];
        if (query.match(/npub\w{58}/)) {
            if (searchInput) {
                searchInput.value = '';
            }
            goto(`/${query}`, { invalidateAll: true });
        } else {
            if (searchInput) {
                searchInput.value = '';
            }
            searchToastVisible = true;
            setTimeout(() => (searchToastVisible = false), 2500);
        }
    }

    function dismissToast() {
        searchToastVisible = false;
    }
</script>

{#if searchToastVisible}
    <div
        id="searchToast"
        class="flex flex-row gap-4 justify-between items-center py-1 px-3
        rounded-md fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-red-600 dark:bg-red-900
        text-white"
        out:fade
    >
        Search is npub only for now.
        <button on:click={dismissToast}>
            <XMarkIcon />
        </button>
    </div>
{/if}
<!-- Mobile menu -->
<div class="header flex md:hidden flex-col gap-4 mb-10 items-center">
    <div class="flex flex-row items-center justify-between w-full">
        <a
            href="/"
            class="no-underline logo flex flex-row items-baseline hover:text-zinc-700 hover:dark:text-zinc-300 border-0"
        >
            <ListrIcon klass="w-6 h-6" />
            <div class="ml-2 logoText text-4xl font-bold font-cursive">Listr</div>
        </a>
        <ProfileMenu />
    </div>
    <div class="grow flex flex-row justify-center w-full">
        <form class="flex gap-2 w-full md:w-3/4" on:submit|preventDefault={searchSubmit}>
            <input
                type="text"
                name="search"
                id="search"
                class="searchInput rounded-md bg-transparent w-full text-sm pr-10"
                placeholder="npub..."
            />
            <button type="submit" class="p-2 -ml-12">
                <SearchIcon />
            </button>
        </form>
    </div>
</div>

<!-- Desktop menu -->
<div class="header hidden md:flex flex-row mb-10 items-center justify-between">
    <a
        href="/"
        class="no-underline border-0 logo flex flex-row items-baseline hover:text-zinc-700 hover:dark:text-zinc-300"
    >
        <ListrIcon klass="w-6 h-6" />
        <div class="ml-2 logoText text-3xl md:text-4xl font-bold font-cursive">Listr</div>
    </a>
    <div class="flex flex-row justify-center w-full">
        <form class="flex gap-2 w-full md:w-3/4" on:submit|preventDefault={searchSubmit}>
            <input
                type="text"
                name="search"
                id="search"
                class="searchInput rounded-md bg-transparent w-full text-sm pr-10"
                placeholder="npub..."
            />
            <button type="submit" class="p-2 -ml-12">
                <SearchIcon />
            </button>
        </form>
    </div>
    <div class="flex flex-row gap-4 items-center shrink-0">
        <DonateButton />
        <ProfileMenu />
    </div>
</div>
