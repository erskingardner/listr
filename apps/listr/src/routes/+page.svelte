<script lang="ts">
    import "../app.css";
    import Logo from "$lib/components/sidebar/Logo.svelte";
    import { browser } from "$app/environment";

    if (browser) {
        document.body.classList.add("bg-gray-900");
        document.body.classList.add("dark:bg-gray-900");
    }
</script>

<svelte:head>
    <title>Listr</title>
    <meta
        name="description"
        content="Listr is the best way to create, manage, and discover Nostr lists."
    />
</svelte:head>

<div class="bg-gray-900">
    <header class="absolute inset-x-0 top-0 z-50">
        <nav class="flex items-center justify-between p-4 lg:px-8" aria-label="Global">
            <div class="flex lg:flex-1">
                <a href="/" class="flex h-16 shrink-0 items-center">
                    <span class="sr-only">Listr</span>
                    <Logo />
                </a>
            </div>
            <div class="flex flex-1 justify-end">
                <a href="/feed" class="text-sm font-semibold leading-6 text-white"
                    >Go to Listr <span aria-hidden="true">&rarr;</span></a
                >
            </div>
        </nav>
    </header>

    <div class="relative isolate pt-14">
        <div
            class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
        >
            <div
                class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
            ></div>
        </div>
        <div class="py-24 sm:py-32 lg:pb-40">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto max-w-2xl text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                        Curate, Organize, and Discover everything Nostr has to offer
                    </h1>
                    <p class="mt-6 text-lg leading-8 text-gray-300">
                        Listr is the best way to create, manage, and browse Nostr lists.<br />Curate
                        collections for your friends, discover the next big thing.
                    </p>
                    <div class="mt-10 flex items-center justify-center gap-x-6">
                        <a
                            href="/feed"
                            class="rounded-md bg-indigo-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                            >Get started</a
                        >
                        <a href="/about" class="text-sm font-semibold leading-6 text-white"
                            >Learn more <span aria-hidden="true">→</span></a
                        >
                    </div>
                </div>
                <img
                    src="images/listr-hero.webp"
                    alt="App screenshot"
                    width="1540"
                    height="1055"
                    class="mt-16 rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 sm:mt-24"
                />
            </div>
            <div class="text-center mt-20">
                Built with ⚡ and 💜 by <a href="https://primal.net/jeffg" class="underline">
                    @JeffG
                </a>
            </div>
        </div>
        <div
            class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-44rem)]"
            aria-hidden="true"
        >
            <div
                class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
            ></div>
        </div>
    </div>
</div>
