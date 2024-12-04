<script lang="ts">
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte";
import { signout } from "$lib/utils/auth";
import { Menu, Search } from "lucide-svelte";
import { expoInOut } from "svelte/easing";
import { scale } from "svelte/transition";
import NewListButton from "../NewListButton.svelte";
import UserAvatar from "../users/UserAvatar.svelte";
import UserName from "../users/UserName.svelte";
import SigninSelector from "./SigninSelector.svelte";

let { openMobileMenu }: { openMobileMenu: () => void } = $props();

let currentUser = getCurrentUser();

let profileMenuVisible = $state(false);
let relayMenuVisible = $state(false);
let searchQuery = $state("");

function toggleProfileMenu() {
    profileMenuVisible = !profileMenuVisible;
}

function toggleRelayMenu() {
    relayMenuVisible = !relayMenuVisible;
}
</script>

<div
    class="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
>
    <button
        type="button"
        class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onclick={openMobileMenu}
    >
        <span class="sr-only">Open sidebar</span>
        <Menu strokeWidth="1.5" size="24" class="text-gray-400 hover:text-gray-500" />
    </button>

    <!-- Separator -->
    <div class="h-6 w-px bg-gray-900/10 dark:bg-gray-50/10 lg:hidden" aria-hidden="true"></div>

    <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form class="relative flex flex-1 items-center" action="/search" method="GET">
            <label for="q" class="sr-only">Search</label>
            <Search
                strokeWidth="1.5"
                class="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-gray-400"
            />
            <input
                id="q"
                class="block h-full w-full border-0 py-0 pl-8 pr-2 dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 placeholder:dark:text-gray-200 focus:ring-0 sm:text-sm"
                placeholder={`e.g. "JeffG", "Content Creators"...`}
                type="search"
                name="q"
                bind:value={searchQuery}
            />
            {#if !!searchQuery}
                <button
                    type="submit"
                    class="whitespace-nowrap rounded-md p-2 text-sm font-semibold leading-6 text-gray-50 bg-indigo-600 hover:bg-indigo-500 hover:text-white"
                >
                    Search
                </button>
            {/if}
        </form>
        <div class="flex items-center gap-x-4 lg:gap-x-6">
            <!-- Separator -->
            <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true"></div>

            <!-- {#if $currentUser}
                <button type="button" class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                    <span class="sr-only">View notifications</span>
                    <Bell strokeWidth="1.5" />
                </button>
            {/if} -->

            <NewListButton buttonText="New list" extraClasses="py-1 hidden lg:flex" />

            <!-- Profile dropdown -->
            {#if currentUser?.user}
                <div class="relative">
                    <button
                        onclick={toggleProfileMenu}
                        type="button"
                        class="-m-1.5 flex items-center p-1.5"
                        id="user-menu-button"
                        aria-expanded="false"
                        aria-haspopup="true"
                    >
                        <span class="sr-only">Open user menu</span>
                        <UserAvatar user={currentUser.user} extraClasses="w-8 h-8 rounded-full" />
                        <span class="hidden lg:flex lg:items-center">
                            <span
                                class="ml-2 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50"
                                aria-hidden="true"
                            >
                                <UserName user={currentUser.user} npubMaxLength={9} />
                            </span>
                            <svg
                                class="ml-2 h-5 w-5 text-gray-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </span>
                    </button>

                    {#if profileMenuVisible}
                        <!-- Dropdown profile menu -->
                        <div
                            onpointerleave={toggleProfileMenu}
                            in:scale={{ duration: 100, easing: expoInOut, start: 0.95 }}
                            out:scale={{ duration: 75, easing: expoInOut, start: 0.95 }}
                            class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white dark:bg-gray-700 dark:text-gray-50 py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="user-menu-button"
                            tabindex="-1"
                        >
                            <a
                                href={`/${currentUser.user.npub}`}
                                class="block px-3 py-1 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-600"
                                role="menuitem"
                                tabindex="-1"
                                id="user-menu-item-0"
                            >
                                Your profile
                            </a>
                            <a
                                href={`/settings`}
                                class="block px-3 py-1 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-600"
                                role="menuitem"
                                tabindex="-1"
                                id="user-menu-item-0"
                            >
                                Settings
                            </a>
                            <button
                                onclick={() => signout(ndk)}
                                ontouchend={() => signout(ndk)}
                                class="block w-full text-left px-3 py-1 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-600"
                                role="menuitem"
                                tabindex="-1"
                                id="user-menu-item-1"
                            >
                                Sign out
                            </button>
                        </div>
                    {/if}
                </div>
            {:else}
                <SigninSelector />
            {/if}
        </div>
    </div>
</div>
