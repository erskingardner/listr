<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
    import ndk from '$lib/stores/ndk';
    import { goto } from '$app/navigation';
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
    import { Avatar } from 'flowbite-svelte';
    import UserInterface from '$lib/interfaces/users';
    import type { Observable } from 'dexie';
    import CirclePlusIcon from '$lib/elements/icons/CirclePlus.svelte';
    import LogoutIcon from '$lib/elements/icons/Logout.svelte';
    import PersonIcon from '$lib/elements/icons/Person.svelte';
    import { dateTomorrow } from '$lib/utils/helpers';

    let user: Observable<App.User>;

    async function login() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        ndk.set($ndk);
        signer.user().then(async (ndkUser) => {
            if (!!ndkUser.npub) {
                const userAttr = { hexpubkey: ndkUser.hexpubkey() };
                currentUser.set(userAttr);
                window.sessionStorage.setItem('listrCurrentUser', JSON.stringify(userAttr));
                document.cookie = `userNpub=${ndkUser.npub};
                expires=${dateTomorrow()}; SameSite=Lax; Secure`;
                user = UserInterface.get(userAttr);
            }
        });
    }

    function logout(e: Event) {
        e.preventDefault();
        currentUser.set(undefined);
        window.sessionStorage.removeItem('listrCurrentUser');
        document.cookie = 'userNpub=';
        goto('/');
    }

    $: {
        if ($user) {
            currentUser.set($user);
            window.sessionStorage.setItem('listrCurrentUser', JSON.stringify($user));
        }
    }
</script>

{#if $currentUser}
    <Popover style="position: relative;" class="h-10 w-10">
        <PopoverButton class="h-10 w-10">
            <Avatar src={$currentUser.image} class="object-cover" />
        </PopoverButton>

        <PopoverPanel
            style="position: absolute; z-index: 10;"
            class="
                w-48 right-0 flex flex-col
                bg-stone-100 dark:bg-stone-900
                p-4 rounded-lg shadow-md
                border border-stone-200 dark:border-stone-800
            "
        >
            <div class="panel-contents flex flex-col gap-2">
                <PopoverButton as="a" href={`/new`} class="popoverPanelLink">
                    <CirclePlusIcon />
                    New list
                </PopoverButton>
                <PopoverButton as="a" href={`/${$currentUser.npub}`} class="popoverPanelLink">
                    <PersonIcon />
                    My profile
                </PopoverButton>
                <PopoverButton
                    on:click={logout}
                    class="primaryButton flex flex-row gap-2 items-center w-full text-left"
                >
                    <LogoutIcon />
                    Log out
                </PopoverButton>
            </div>
        </PopoverPanel>
    </Popover>
{:else}
    <button on:click={login} class="primaryButton whitespace-nowrap">Log in</button>
{/if}
