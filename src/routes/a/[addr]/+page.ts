import type { PageLoad } from './$types';
import { nip19 } from 'nostr-tools';

export const load = (async ({ params }) => {
    let decodedAddr;
    try {
        decodedAddr = nip19.decode(params.addr);
    } catch (error) {
        throw new Error(`Error decoding address: ${error}`);
    }

    return {
        type: decodedAddr.type,
        data: JSON.stringify(decodedAddr.data)
    };
}) satisfies PageLoad;
