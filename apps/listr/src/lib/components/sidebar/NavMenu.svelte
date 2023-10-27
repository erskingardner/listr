<script lang="ts">
    import { Newspaper, HelpCircle, LifeBuoy, Github } from "lucide-svelte";
    import { NDKEvent, NDKKind, NDKList } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import currentUser, { currentUserSettings } from "$lib/stores/currentUser";
    import { onMount, onDestroy } from "svelte";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
    import { SUPPORTED_LIST_KINDS, filterAndSortByTitle } from "$lib/utils";
    import { createEventDispatcher } from "svelte";
    import { page } from "$app/stores";
    import { Tooltip } from "flowbite-svelte";
    import NewListButton from "../NewListButton.svelte";
    import DonateButton from "../DonateButton.svelte";
    import SigninSelector from "../header/SigninSelector.svelte";

    const dispatch = createEventDispatcher();

    let currentUserLists: NDKEventStore<ExtendedBaseType<NDKList>>;
    let deletedEvents: NDKEventStore<ExtendedBaseType<NDKEvent>>;

    function subscribeToUserLists() {
        if ($currentUser) {
            currentUserLists = $ndk.storeSubscribe(
                {
                    kinds: SUPPORTED_LIST_KINDS,
                    authors: [$currentUser.hexpubkey],
                },
                { closeOnEose: false },
                NDKList
            );

            deletedEvents = $ndk.storeSubscribe({
                kinds: [NDKKind.EventDeletion],
                authors: [$currentUser.hexpubkey],
            });
        }
    }

    onMount(() => {
        subscribeToUserLists();
    });

    onDestroy(() => {
        currentUserLists?.unsubscribe();
        deletedEvents?.unsubscribe();
    });

    $: if ($currentUserLists) {
        $currentUserLists = filterAndSortByTitle($currentUserLists, $deletedEvents);
    }

    $: if ($currentUser) subscribeToUserLists();
</script>

<nav class="flex flex-1 flex-col relative">
    <ul role="list" class="flex flex-1 flex-col gap-y-7">
        {#if $currentUser}
            <li>
                <NewListButton
                    buttonText="Create a new list"
                    class="-mx-2"
                    on:click={() => dispatch("closeMobileMenu")}
                />
            </li>
        {/if}
        <li>
            <ul role="list" class="-mx-2 space-y-1">
                <li>
                    <a
                        href="/feed"
                        class="{$page.url.pathname === '/feed'
                            ? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'} group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        on:click={() => dispatch("closeMobileMenu")}
                    >
                        <Newspaper strokeWidth="1.5" size="20" />
                        Activity Feed
                    </a>
                </li>
                <li>
                    <a
                        href="/about"
                        class="{$page.url.pathname === '/about'
                            ? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'} group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        on:click={() => dispatch("closeMobileMenu")}
                    >
                        <HelpCircle strokeWidth="1.5" size="20" />
                        About Listr
                    </a>
                </li>
                <li>
                    <a
                        href="https://primal.net/jeffg"
                        class="text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        target="_blank"
                        on:click={() => dispatch("closeMobileMenu")}
                    >
                        <LifeBuoy strokeWidth="1.5" size="20" />
                        Help / Feedback
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/erskingardner/listr"
                        class="text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        target="_blank"
                        on:click={() => dispatch("closeMobileMenu")}
                    >
                        <Github strokeWidth="1.5" size="20" />
                        Listr on Github
                    </a>
                </li>
                <li>
                    <DonateButton
                        on:donateButtonClicked
                        class="w-full text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                    />
                </li>
            </ul>
        </li>
        {#if $currentUser}
            <!-- <li>
                <div class="text-xs font-semibold leading-6 text-gray-400">Pinned Lists</div>
                <ul role="list" class="-mx-2 mt-2 space-y-1">
                    <li>
                        <a
                            href="#"
                            class="text-gray-400 hover:text-white hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        >
                            <span
                                class="flex font-mono h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
                                >M</span
                            >
                            <span class="truncate">Memes from @tanel</span>
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-gray-400 hover:text-white hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        >
                            <span
                                class="flex font-mono h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
                                >W</span
                            >
                            <span class="truncate">Writers from @gek</span>
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-gray-400 hover:text-white hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        >
                            <span
                                class="flex font-mono h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
                                >B</span
                            >
                            <span class="truncate">Best fishing trips from @bobbylongname</span>
                        </a>
                    </li>
                </ul>
            </li> -->
            <li class="mb-10">
                <div class="text-xs font-semibold leading-6 text-gray-400">Your lists</div>
                <ul role="list" class="-mx-2 mt-2 space-y-1">
                    {#if $currentUserLists}
                        {#each $currentUserLists as list}
                            <li>
                                <a
                                    href="/{$currentUser.npub}/{list.kind}/{list.encode()}"
                                    class="{$page.url.pathname ===
                                    `/${$currentUser.npub}/${list.kind}/${list.encode()}`
                                        ? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
                                        : 'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'} group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                    on:click={() => dispatch("closeMobileMenu")}
                                >
                                    <span
                                        class="flex font-mono h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-500 bg-gray-400 dark:border-gray-700 dark:bg-gray-800 text-[0.625rem] font-medium text-gray-700 group-hover:text-black dark:text-gray-400 dark:group-hover:text-white"
                                        >{list.title?.slice(0, 1).toUpperCase()}</span
                                    >
                                    <span class="truncate">{list.title}</span>
                                    {#if $currentUserSettings?.devMode}
                                        <Tooltip
                                            type="custom"
                                            placement="right"
                                            class="text-xs bg-transparent border-none shadow-none"
                                        >
                                            k: {list.kind}
                                        </Tooltip>
                                    {/if}
                                </a>
                            </li>
                        {/each}
                    {/if}
                </ul>
            </li>
        {:else}
            <li class="mb-10 -mx-2">
                <SigninSelector buttonClass="w-full py-2" dropdownClass="" />
            </li>
        {/if}
    </ul>
    <div
        class="border-t border-gray-500 dark:border-gray-800 text-gray-700 dark:text-gray-400 text-sm -mx-6 px-6 py-4 bottom-0 bg-gray-400 dark:bg-gray-950 sticky"
    >
        Built with ⚡ and 💜 by <a
            href="https://primal.net/jeffg"
            class="underline hover:no-underline font-medium">JeffG</a
        >
    </div>
</nav>
