<script lang="ts">
    import { currentUser, currentUserProfile } from '$lib/stores/currentUser';
    import { settings } from '$lib/stores/settings';
    import ndk from '$lib/stores/ndk';
    import { goto } from '$app/navigation';
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import Avatar from '$lib/components/Avatar.svelte';
    import { NDKNip07Signer } from '@nostr-dev-kit/ndk';

    export async function login() {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        ndk.set($ndk);
        await $ndk.connect();
        signer.user().then(async (user) => {
            if (!!user.npub) {
                user.ndk = $ndk;
                currentUser.set(user);
                window.sessionStorage.setItem('listrCurrentUser', JSON.stringify(user));
                user.fetchProfile().then(async () => {
                    currentUser.set(user);
                    currentUserProfile.set(user.profile);
                    window.sessionStorage.setItem('listrCurrentUser', JSON.stringify(user));
                    window.sessionStorage.setItem(
                        'listrCurrentUserProfile',
                        JSON.stringify(user.profile)
                    );
                });
            }
        });
    }

    export function logout(e: Event) {
        e.preventDefault();
        currentUser.set(undefined);
        currentUserProfile.set(undefined);
        window.sessionStorage.removeItem('listrCurrentUser');
        window.sessionStorage.removeItem('listrCurrentUserProfile');
        goto('/');
    }

    export function changeTheme(e: Event) {
        e.preventDefault();
        $settings.theme === 'dark'
            ? settings.set({ theme: 'light', ...settings })
            : settings.set({ theme: 'dark', ...settings });
        window.sessionStorage.setItem('listrSettings', JSON.stringify($settings));
    }
</script>

{#if $currentUserProfile}
    <Popover style="position: relative;" class="ml-auto h-12">
        <PopoverButton>
            <Avatar userProfile={$currentUserProfile} />
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
