import type { PageLoad } from './$types';
import UserInterface from '$lib/interfaces/users';
import ReplaceableListInterface from '$lib/interfaces/replaceableLists';
import { nip19 } from 'nostr-tools';
import type { AddressPointer } from 'nostr-tools/lib/nip19';

export const load = (async ({ params }) => {
    let decodedAddr;
    try {
        decodedAddr = nip19.decode(params.addr);
        let data;
        if (decodedAddr.type === 'naddr') {
            data = decodedAddr.data as AddressPointer;
            UserInterface.get({ hexpubkey: data?.pubkey });
            ReplaceableListInterface.getForUser({ hexpubkey: data?.pubkey });
        }
    } catch (error) {
        throw new Error(`Error decoding address: ${error}`);
    }

    return {
        type: decodedAddr.type,
        data: JSON.stringify(decodedAddr.data)
    };
}) satisfies PageLoad;
