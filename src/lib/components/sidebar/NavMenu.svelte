<script lang="ts">
import { NDKEvent, NDKKind, NDKList, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import { Github, HelpCircle, LifeBuoy, Merge, Newspaper } from "lucide-svelte";
import { onDestroy } from "svelte";
import { page } from "$app/stores";
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte";
import { filterAndSortByTitle, SUPPORTED_LIST_KINDS } from "$lib/utils";
import DonateButton from "../DonateButton.svelte";
import SigninSelector from "../header/SigninSelector.svelte";
import NewListButton from "../NewListButton.svelte";

let {
    closeMobileMenu,
    donateButtonClicked,
}: { closeMobileMenu?: () => void; donateButtonClicked: () => void } = $props();

let currentUser = $derived(getCurrentUser());

let currentUserLists: NDKList[] = $state([]);
let deletedEvents: NDKEvent[] = $state([]);
let listsSub: NDKSubscription | null = $state(null);
let deletesSub: NDKSubscription | null = $state(null);
let filteredLists = $derived(filterAndSortByTitle(currentUserLists, deletedEvents));

$effect(() => {
    if (currentUser?.user && !listsSub) {
        listsSub = ndk.subscribe(
            {
                kinds: SUPPORTED_LIST_KINDS,
                authors: [currentUser.user.pubkey],
            },
            { closeOnEose: false }
        );

        listsSub.on("event", (event: NDKEvent) => {
            currentUserLists = [...currentUserLists, NDKList.from(event)];
        });
    }

    if (currentUser?.user && !deletesSub) {
        deletesSub = ndk.subscribe(
            {
                kinds: [NDKKind.EventDeletion],
                authors: [currentUser.user.pubkey],
            },
            { closeOnEose: false }
        );

        deletesSub.on("event", (event: NDKEvent) => {
            deletedEvents = [...deletedEvents, event];
        });
    }
});

onDestroy(() => {
    listsSub?.stop();
    deletesSub?.stop();
});
</script>

<nav class="flex flex-1 flex-col relative">
    <ul role="list" class="flex flex-1 flex-col gap-y-7">
        {#if currentUser?.user}
            <li>
                <NewListButton
                    buttonText="Create a new list"
                    extraClasses="-mx-2"
                    {closeMobileMenu}
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
                        onclick={closeMobileMenu}
                    >
                        <Newspaper strokeWidth="1.5" size="20" />
                        Activity Feed
                    </a>
                </li>
                {#if currentUser?.user}
                    <li>
                        <a
                            href="/merge"
                            class="{$page.url.pathname === '/merge'
                                ? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
                                : 'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'} group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                            onclick={closeMobileMenu}
                        >
                            <Merge strokeWidth="1.5" size="20" />
                            Merge Lists
                        </a>
                    </li>
                {/if}
                <li>
                    <a
                        href="/about"
                        class="{$page.url.pathname === '/about'
                            ? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'} group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        onclick={closeMobileMenu}
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
                        onclick={closeMobileMenu}
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
                        onclick={closeMobileMenu}
                    >
                        <Github strokeWidth="1.5" size="20" />
                        Listr on Github
                    </a>
                </li>
                <!-- <li>
                    <DonateButton
                        {donateButtonClicked}
                        extraClasses="w-full text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                    />
                </li> -->
            </ul>
        </li>
        {#if currentUser?.user}
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
                    {#if filteredLists.length > 0}
                        {#each filteredLists as list}
                            <li>
                                <a
                                    href="/{currentUser.user?.npub}/{list.kind}/{list.encode()}"
                                    class="{$page.url.pathname ===
                                    `/${currentUser.user?.npub}/${list.kind}/${list.encode()}`
                                        ? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
                                        : 'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'} group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                    onclick={closeMobileMenu}
                                >
                                    <span
                                        class="flex font-mono h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-500 bg-gray-400 dark:border-gray-700 dark:bg-gray-800 text-[0.625rem] font-medium text-gray-700 group-hover:text-black dark:text-gray-400 dark:group-hover:text-white"
                                        >{list.title?.slice(0, 1).toUpperCase()}</span
                                    >
                                    <span class="truncate">{list.title}</span>
                                    {#if currentUser?.settings?.devMode}
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
                <SigninSelector buttonClass="w-full py-2" />
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
