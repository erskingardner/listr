<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
    import ndk from '$lib/stores/ndk';
    import { goto } from '$app/navigation';
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
    import { Avatar, Modal } from 'flowbite-svelte';
    import type { Observable } from 'dexie';
    import CirclePlusIcon from '$lib/elements/icons/CirclePlus.svelte';
    import LogoutIcon from '$lib/elements/icons/Logout.svelte';
    import PersonIcon from '$lib/elements/icons/Person.svelte';
    import { dateTomorrow } from '$lib/utils/helpers';
    import User from '$lib/classes/user';
    import { RelayList } from '@nostr-dev-kit/ndk-svelte-components';

    let user: Observable<User>;

    let signerModal = false;

    async function login() {
        try {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
            ndk.set($ndk);
            signer.user().then(async (ndkUser) => {
                if (!!ndkUser.npub) {
                    ndkUser.ndk = $ndk;
                    user = User.get(ndkUser.hexpubkey());
                    currentUser.set($user);
                    window.sessionStorage.setItem('listrCurrentUser', JSON.stringify($user));
                    document.cookie = `userNpub=${ndkUser.npub};
                    expires=${dateTomorrow()}; SameSite=Lax; Secure`;
                }
            });
        } catch (error: any) {
            console.log(error.message);
            signerModal = true;
        }
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

<Modal title="Nostr Signing Extension Not Found" bind:open={signerModal} autoclose>
    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        Listr is an app built on <span class="font-bold">Nostr</span>. To log in and manage your
        lists you need to sign events with your Nostr keys using a browser extension like Alby or
        nos2x in Chrome or Brave.
    </p>
    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        If you're unsure what Nostr is and want to learn more please check out <a
            href="https://nostr.how?utm_source=listr&utm_medium=signerModal">Nostr.how</a
        >
    </p>
    <svelte:fragment slot="footer">
        <div
            class="flex flex-col gap-8 md:flex-row items-center justify-center md:justify-around w-full"
        >
            <a
                href="https://getalby.com?utm_source=listr&utm_medium=signerModal"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0"
                target="_blank"
            >
                <span class="">Get Alby</span>
            </a>
            <a
                href="https://github.com/fiatjaf/nos2x"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0"
                target="_blank"
            >
                <span class="">Get nos2x</span>
            </a>
            <a
                href="https://nostr.how?utm_source=listr&utm_medium=signerModal"
                class="transition-all px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md h-fit border-0"
                target="_blank"
            >
                <span class="">Learn more</span>
            </a>
        </div>
    </svelte:fragment>
</Modal>

{#if $currentUser}
    <Popover style="position: relative;" class="h-10 w-10">
        <PopoverButton class="h-10 w-10">
            <Avatar src={$currentUser.image} class="object-cover" />
        </PopoverButton>

        <PopoverPanel
            style="position: absolute; z-index: 10;"
            class="
                w-80 right-0 flex flex-col
                bg-zinc-100 dark:bg-zinc-900
                p-4 rounded-lg shadow-md
                border border-zinc-200 dark:border-zinc-800
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
                <PopoverButton on:click={logout} class="popoverPanelLink">
                    <LogoutIcon />
                    Log out
                </PopoverButton>
                <div class="border-b border-zinc-200 dark:border-zinc-800 mt-2 mb-1" />
                <h4 class="font-semibold">Relays</h4>
                <RelayList ndk={$ndk} />
            </div>
        </PopoverPanel>
    </Popover>
{:else}
    <button on:click={login} class="primaryButton whitespace-nowrap">Log in</button>
{/if}
