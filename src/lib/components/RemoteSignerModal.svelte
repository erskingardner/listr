<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { bunkerNdk } from "$lib/stores/ndk";
    import ndk from "$lib/stores/ndk";
    import Loader from "./Loader.svelte";
    import { SigninMethod, signin } from "$lib/utils/auth";

    export let modalOpen: boolean;
    let attemptingConnection: boolean = false;
    let token: string = "";

    async function connectNsecBunker() {
        attemptingConnection = true;
        const user = await signin($ndk, $bunkerNdk!, SigninMethod.Nip46, token);
        if (user) {
            modalOpen = false;
        }
        attemptingConnection = false;
    }
</script>

<Modal
    title="Connect to nsecBunker"
    bind:open={modalOpen}
    placement="top-center"
    backdropClass="fixed inset-0 z-40 bg-black/60"
>
    <div class="p-4">
        <p class="text-gray-900 dark:text-white mb-4">
            <a href="https://nsecbunker.com/" class="underline">nsecBunker</a> is a NIP-46 remote signer
            that allows you to keep your private key secured in a single location and remotely sign Nostr
            events. If you don't have an nsecBunker set up already, follow the link above to get started.
        </p>
        <p class="text-gray-900 dark:text-white mb-4">
            Create a token on nsecBunker with full event permissions and then enter it below. You'll
            only have to do this once.
        </p>
        <form
            class="flex flex-col gap-6 items-start my-6"
            on:submit|preventDefault={connectNsecBunker}
        >
            <label for="token" class="flex flex-col gap-2 items-start w-full"
                >Token
                <input
                    type="text"
                    bind:value={token}
                    name="token"
                    placeholder="npub1...#secret"
                    class="w-full"
                />
            </label>
            <button
                type="submit"
                class="flex flex-row gap-2 justify-center items-center p-2 bg-indigo-600 text-white font-medium rounded-md w-full"
            >
                Submit
                {#if attemptingConnection}
                    <Loader class="w-5 h-5 border-t-indigo-800" />
                {/if}
            </button>
        </form>
    </div>
</Modal>
