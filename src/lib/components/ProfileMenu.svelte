<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
    import ndk from '$lib/stores/ndk';
    import { goto } from '$app/navigation';
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
    import { Avatar } from 'flowbite-svelte';
    import UserInterface from '$lib/interfaces/users';
    import type { Observable } from 'dexie';

    let user: Observable<App.User>;
    export async function login() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        ndk.set($ndk);
        await $ndk.connect();
        signer.user().then(async (ndkUser) => {
            if (!!ndkUser.npub) {
                ndkUser.ndk = $ndk;
                const userAttr = { hexpubkey: ndkUser.hexpubkey() };
                currentUser.set(userAttr);
                window.sessionStorage.setItem('listrCurrentUser', JSON.stringify(userAttr));
                user = UserInterface.get(userAttr);
            }
        });
    }

    export function logout(e: Event) {
        e.preventDefault();
        currentUser.set(undefined);
        window.sessionStorage.removeItem('listrCurrentUser');
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
    <Popover style="position: relative;" class="ml-auto h-12">
        <PopoverButton>
            <Avatar src={$currentUser.image} />
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
                <PopoverButton as="a" href="/profile" class="profilePanelLink">
                    My profile
                </PopoverButton>
                <PopoverButton on:click={logout} class="primaryButton w-full text-left">
                    Log out
                </PopoverButton>
            </div>
        </PopoverPanel>
    </Popover>
{:else}
    <button on:click={login} class="primaryButton"> Log in </button>
{/if}
