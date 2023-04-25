<script lang="ts">
    import CheckIcon from '$lib/elements/icons/Check.svelte';
    import XMarkIcon from '$lib/elements/icons/XMark.svelte';
    import { nip19 } from 'nostr-tools';
    import type { NDKTag } from '@nostr-dev-kit/ndk/lib/src/events';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let list: App.List;

    let itemAddr: string = '';
    let errorMessage: string = '';
    let tagsForEvent: NDKTag[] = [];

    function closeForm() {
        dispatch('closeForm');
    }

    function validate() {
        if (itemAddr === '') {
            errorMessage = 'NIP-19 identifier required';
        } else {
            // Decode & validate nip-19 identifiers
            errorMessage = validateAddrForListType();
        }
        return errorMessage;
    }

    function validateAddrForListType() {
        try {
            const { type, data } = nip19.decode(itemAddr);
            switch (type) {
                case 'nsec':
                    errorMessage = '😱 Be more careful with that private key!';
                case 'npub':
                case 'nprofile':
                    if (list.kind !== 10001) {
                        errorMessage = '';
                    } else {
                        errorMessage = "You can't add people to Pin lists";
                    }
                    break;
                case 'nevent':
                case 'note':
                case 'naddr':
                    if (list.kind === 30000) {
                        errorMessage = "You can't add notes & events to People lists";
                    } else {
                        errorMessage = '';
                    }
                    break;
                default:
                    errorMessage = 'Unknown identifier. Please get in touch. Link in footer.';
                    break;
            }
        } catch (error) {
            errorMessage = 'Not a valid NIP-19 identifier.';
        }
        return errorMessage;
    }

    function validateAndSubmit() {
        validate();
        if (errorMessage === '') {
            dispatch('addItemToList', { addr: itemAddr });
            tagsForEvent = [];
            itemAddr = '';
            errorMessage = '';
        }
    }
</script>

<div class="flex flex-col gap-2 w-full relative">
    <div class="flex flex-row gap-4 w-full">
        <input
            type="text"
            name="itemAddr"
            id="itemAddr"
            class="border rounded-md bg-transparent w-1/2 grow"
            placeholder="Add a public item to this list. NIP-19 identifier (npub, nprofile, note, nevent, or naddr)."
            bind:value={itemAddr}
            on:blur={validate}
        />
        <button
            on:click={validateAndSubmit}
            disabled={!!errorMessage.length}
            class="relative border rounded-md px-2 border-green-500
            hover:text-green-500 disabled:text-stone-600 disabled:border-stone-600"
        >
            <CheckIcon />
        </button>
        <button
            class="p-2 w-fit mx-auto rounded-md border border-red-500 dark:border-red-800
            hover:text-red-500 dark:hover:text-red-800"
            on:click={closeForm}
        >
            <XMarkIcon />
        </button>
    </div>
    {#if errorMessage}
        <div class="errors text-red-500 dark:text-red-800 ml-4">{errorMessage}</div>
    {/if}
</div>
