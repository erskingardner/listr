<script lang="ts">
import { NDKEvent, NDKKind, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { Tooltip } from "flowbite-svelte";
import { Info } from "lucide-svelte";
import toast from "svelte-hot-french-toast";
import ndk from "$lib/stores/ndk.svelte";
import { unixTimeNowInSeconds } from "$lib/utils";

let currentUser = $derived(ndk.$currentUser);
let devMode = $state(false);

// TODO: User settings are not currently managed by NDK sessions
// For now, we'll keep the settings logic but note that it needs to be refactored
// to work with the new session system or store settings locally

async function saveSettings(e: SubmitEvent) {
    e.preventDefault();
    if (!currentUser) return;

    const settingsObj: App.UserSettings = {
        devMode: devMode ? devMode : false,
    };

    const settingsEvent = new NDKEvent(ndk, {
        kind: NDKKind.AppSpecificData,
        pubkey: currentUser.pubkey,
        created_at: unixTimeNowInSeconds(),
        tags: [["d", "listr/settings/v1"]],
        content: JSON.stringify(settingsObj),
    });

    let signer: NDKNip07Signer;
    if (!ndk.signer) {
        signer = new NDKNip07Signer();
        ndk.signer = signer;
    }

    await settingsEvent.encrypt(currentUser);
    await settingsEvent.publish();
    toast.success("Settings updated");
}
</script>

<svelte:head>
    <title>Settings - Listr</title>
    <meta name="description" content="Your settings on Listr" />
</svelte:head>

<div
    class="flex flex-col gap-2 border border-gray-30 dark:border-gray-700 rounded-md shadow-md p-4 grow"
>
    <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="flex flex-col gap-1 w-full lg:w-auto">
            <div
                class="text-base lg:text-lg font-bold flex flex-row justify-start items-center gap-2"
            >
                Settings
            </div>
        </div>
    </div>
    <hr class="dark:border-gray-700" />
    <div class="">
        <form onsubmit={saveSettings}>
            <div class="flex flex-row gap-2 items-center my-6">
                <input type="checkbox" id="devMode" bind:checked={devMode} />
                <label for="devMode">Developer Mode</label>
                <Info strokeWidth="1.5" size="20" />
                <Tooltip type="auto" class="z-50">
                    View list kinds and turn on ability to copy nip19 & hex IDs
                </Tooltip>
            </div>
            <button class="primaryActionButton" type="submit">Save settings</button>
        </form>
    </div>
</div>
