<script lang="ts">
    import { currentUserPubkey, currentUserProfile } from '$lib/stores/currentUser';
    import { settings } from '$lib/stores/settings';
    import ndk from '$lib/stores/ndk';
    import { goto } from '$app/navigation';
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import Avatar from '$lib/components/Avatar.svelte';
    import { NDKNip07Signer } from '@nostr-dev-kit/ndk';

    export async function login() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        signer.user().then(async (user) => {
            if (!!user.npub) {
                currentUserPubkey.set(user.npub);
                localStorage.setItem('listrCurrentUserPubkey', user.npub);
                user.fetchProfile().then(async () => {
                    currentUserProfile.set(user.profile);
                    localStorage.setItem('listrCurrentUserProfile', JSON.stringify(user.profile));
                });
            }
        });
    }

    export function logout(e: Event) {
        e.preventDefault();
        currentUserPubkey.set('');
        currentUserProfile.set(undefined);
        localStorage.removeItem('listrCurrentUserPubkey');
        localStorage.removeItem('listrCurrentUserProfile');
        goto('/');
    }

    export function changeTheme(e: Event) {
        e.preventDefault();
        $settings.theme === 'dark'
            ? settings.set({ theme: 'light', ...settings })
            : settings.set({ theme: 'dark', ...settings });
        localStorage.setItem('listrTheme', $settings.theme);
    }
</script>

{#if !!$currentUserPubkey}
    <Popover style="position: relative;" class="ml-auto h-12">
        <PopoverButton>
            {#if $currentUserProfile}
                <Avatar profileMetadata={$currentUserProfile} />
            {/if}
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
                    Profile
                </PopoverButton>
                <PopoverButton as="a" href="#" on:click={changeTheme} class="profilePanelLink">
                    Change theme
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
