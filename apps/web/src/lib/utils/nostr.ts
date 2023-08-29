import { nip19 } from "nostr-tools";

export const NOSTR_BECH32_REGEXP =
    /^(npub|nprofile|note|nevent|naddr|nrelay)1[023456789acdefghjklmnpqrstuvwxyz]+/;

export function nip19ToTag(nip19Id: string): string[] {
    const decoded = nip19.decode(nip19Id);
    console.log(decoded);

    let tag: string[];
    switch (decoded.type) {
        case "npub":
        case "note":
            return ["p", decoded.data];
        case "nprofile":
            tag = ["e", decoded.data.pubkey];
            if (decoded.data.relays && decoded.data.relays.length > 0)
                tag.push(decoded.data.relays[0]);
            return tag;
        case "nevent":
            tag = ["e", decoded.data.id];
            if (decoded.data.relays && decoded.data.relays.length > 0)
                tag.push(decoded.data.relays[0]);
            return tag;
        case "naddr":
            tag = ["a", `${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`];
            if (decoded.data.relays && decoded.data.relays.length > 0) {
                tag.push(decoded.data.relays[0]);
            }
            return tag;
    }
}
