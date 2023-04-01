<script lang="ts">
    import { authedPubkey, authedProfileMetadata, theme } from '$lib/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { Author, RelayPool } from 'nostr-relaypool';
    import { relays } from '$lib/const';
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import Avatar from './Avatar.svelte';

    $: loggedIn = !!$authedPubkey;

    onMount(async () => {
        const pubkey = localStorage.getItem('listrAuthedPubkey');
        const storedProfileMetadata = localStorage.getItem('listrAuthedProfileMetadata');

        if (pubkey) {
            authedPubkey.set(pubkey);
        }

        if (storedProfileMetadata) {
            authedProfileMetadata.set(storedProfileMetadata);
        }
    });

    export async function login() {
        const publicKey: string = await window.nostr.getPublicKey();
        if (!!publicKey) {
            authedPubkey.set(publicKey);
            localStorage.setItem('listrAuthedPubkey', publicKey);
            let relayPool = new RelayPool();
            const author = new Author(relayPool, relays, publicKey);
            if (author !== undefined) {
                author.metaData((e) => {
                    authedProfileMetadata.set(e.content);
                    localStorage.setItem('listrAuthedProfileMetadata', e.content);
                    relayPool.close();
                }, 0);
            }
        }
    }

    export function logout(e: Event) {
        e.preventDefault();
        authedPubkey.set('');
        authedProfileMetadata.set('');
        localStorage.removeItem('listrAuthedPubkey');
        localStorage.removeItem('listrAuthedProfileMetadata');
        goto('/');
    }

    export function changeTheme(e: Event) {
        e.preventDefault();
        $theme === 'dark' ? theme.set('light') : theme.set('dark');
    }
</script>

{#if loggedIn}
    <Popover style="position: relative;" class="ml-auto h-12">
        <PopoverButton>
            {#if $authedProfileMetadata}
                <Avatar profileMetadata={JSON.parse($authedProfileMetadata)} />
            {/if}
        </PopoverButton>

        <PopoverPanel
            style="position: absolute; z-index: 10;"
            class="w-40 right-0 flex flex-col bg-stone-100 dark:bg-stone-900 p-4 rounded-lg shadow-md border border-stone-200 dark:border-stone-800"
        >
            <div class="panel-contents flex flex-col gap-2">
                <PopoverButton as="a" href="/profile" class="profilePanelLink">
                    Profile
                </PopoverButton>
                <PopoverButton as="a" href="#" on:click={changeTheme} class="profilePanelLink">
                    Change theme
                </PopoverButton>
                <PopoverButton on:click={logout} class="primaryButton w-full">
                    Log out
                </PopoverButton>
            </div>
        </PopoverPanel>
    </Popover>
{:else}
    <button on:click={login} class="primaryButton"> Log in </button>
{/if}
