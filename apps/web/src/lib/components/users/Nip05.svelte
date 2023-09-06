<script lang="ts">
    import { prettifyNip05 } from "@nostr-dev-kit/ndk-svelte-components";
    import { BadgeHelp, BadgeCheck, BadgeX } from "lucide-svelte";
    import { Tooltip } from "flowbite-svelte";

    export let pubkey: string;
    export let nip05: string;

    let nip05Valid: boolean | void;
    $: validNip05(pubkey, nip05).then((value) => (nip05Valid = value));

    async function validNip05(pubkey: string, nip05: string): Promise<boolean | void> {
        let name: string | undefined = undefined;
        let domain: string | undefined = undefined;

        if (nip05.match(/@/)) {
            name = nip05.split("@")[0];
            domain = nip05.split("@")[1];
        } else if (
            nip05.match(
                /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
            )
        ) {
            name = "_";
            domain = nip05;
        }

        let wellKnown;
        if (!domain) return undefined;

        const validOrNot = fetch(`https://${domain}/.well-known/nostr.json?name=${name}`)
            .then(async (response) => {
                if (response.status === 200) {
                    wellKnown = await response.json();
                    return wellKnown.names[name as string] === pubkey;
                }
                return undefined;
            })
            .catch((err) => {
                console.error("Error validating NIP-05", err);
                return undefined;
            });
        return validOrNot;
    }
</script>

<span
    class="flex flex-row gap-1 items-center text-xs whitespace-nowrap min-w-0 overflow-hidden text-ellipsis"
>
    {#if nip05Valid === undefined}
        <BadgeHelp size="16" strokeWidth="1.5" class="fill-gray-200 stroke-gray-600" />
        <Tooltip type="light">Attempting to validate</Tooltip>
    {:else if nip05Valid}
        <BadgeCheck size="16" strokeWidth="1.5" class="fill-purple-200 stroke-purple-800" />
        <Tooltip type="light">Verified</Tooltip>
    {:else}
        <BadgeX size="16" strokeWidth="1.5" class="fill-red-200 stroke-red-800" />
        <Tooltip type="light">Invalid</Tooltip>
    {/if}
    {prettifyNip05(nip05)}
</span>
