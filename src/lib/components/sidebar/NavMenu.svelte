<script lang="ts">
    import { Newspaper, PlusCircle, LogIn } from "lucide-svelte";
    import { NDKEvent, NDKKind, NDKList } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { beforeUpdate, onMount, onDestroy } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
    import { filterAndSort } from "$lib/utils";
    import { createEventDispatcher } from "svelte";
    import { page } from "$app/stores";

    const dispatch = createEventDispatcher();

    let currentUserLists: NDKEventStore<NDKList>;
    let deletedEvents: NDKEventStore<NDKEvent>;

    onMount(() => {
        if ($currentUser) {
            currentUserLists = $ndk.storeSubscribe(
                {
                    kinds: [
                        NDKKind.MuteList as number,
                        NDKKind.PinList as number,
                        NDKKind.CategorizedBookmarkList as number,
                        NDKKind.CategorizedPeopleList as number,
                    ],
                    authors: [$currentUser.hexpubkey()],
                },
                { closeOnEose: false },
                NDKList
            );

            deletedEvents = $ndk.storeSubscribe({
                kinds: [NDKKind.EventDeletion],
                authors: [$currentUser.hexpubkey()],
            });
        }
    });

    beforeUpdate(() => {
        currentUserLists?.unsubscribe();
        deletedEvents?.unsubscribe();
    });

    onDestroy(() => {
        currentUserLists?.unsubscribe();
        deletedEvents?.unsubscribe();
    });

    afterNavigate(() => {
        if ($currentUser) {
            currentUserLists = $ndk.storeSubscribe(
                {
                    kinds: [
                        NDKKind.MuteList as number,
                        NDKKind.PinList as number,
                        NDKKind.CategorizedBookmarkList as number,
                        NDKKind.CategorizedPeopleList as number,
                    ],
                    authors: [$currentUser.hexpubkey()],
                },
                { closeOnEose: false },
                NDKList
            );

            deletedEvents = $ndk.storeSubscribe({
                kinds: [NDKKind.EventDeletion],
                authors: [$currentUser.hexpubkey()],
            });
        }
    });

    $: if ($currentUserLists) {
        $currentUserLists = filterAndSort($currentUserLists, $deletedEvents);
    }
</script>

<nav class="flex flex-1 flex-col">
    <ul role="list" class="flex flex-1 flex-col gap-y-7">
        <li>
            <ul role="list" class="-mx-2 space-y-1">
                <li>
                    <a
                        href="/"
                        class="{$page.url.pathname === '/'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'} group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                    >
                        <Newspaper strokeWidth="1.5" />
                        Feed
                    </a>
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
            <li>
                <div class="text-xs font-semibold leading-6 text-gray-400">Your lists</div>
                <ul role="list" class="-mx-2 mt-2 space-y-1">
                    {#if $currentUserLists}
                        {#each $currentUserLists as list}
                            <li>
                                <a
                                    href="/{$currentUser.npub}/{list.kind}/{list.encode()}"
                                    class="{$page.url.pathname ===
                                    `/${$currentUser.npub}/${list.kind}/${list.encode()}`
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'} hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                >
                                    <span
                                        class="flex font-mono h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
                                        >{list.name?.slice(0, 1).toUpperCase()}</span
                                    >
                                    <span class="truncate">{list.name}</span>
                                </a>
                            </li>
                        {/each}
                    {/if}
                </ul>
            </li>
            <li class="mb-10">
                <a
                    href="/new"
                    class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white"
                >
                    <PlusCircle strokeWidth="1.5" />
                    Create a new list
                </a>
            </li>
        {:else}
            <li class="mb-10">
                <button
                    on:click={() => dispatch("signin")}
                    class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white"
                >
                    <LogIn strokeWidth="1.5" />
                    Sign in to manage your lists
                </button>
            </li>
        {/if}
    </ul>
</nav>
