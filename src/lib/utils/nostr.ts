import { NDKKind, type NDKTag } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

export const NOSTR_BECH32_REGEXP =
    /^(npub|nprofile|note|nevent|naddr|nrelay)1[023456789acdefghjklmnpqrstuvwxyz]+/;

export function nip19ToTag(nip19Id: string): string[] | undefined {
    const decoded = nip19.decode(nip19Id);

    let tag: string[];
    switch (decoded.type) {
        case "npub":
            return ["p", decoded.data];
        case "note":
            return ["e", decoded.data];
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
        case "nrelay":
            tag = ["relay", decoded.data];
            return tag;
    }
}

export function stringInputToTag(
    input: string,
    listKind: number,
    markers?: string[]
): NDKTag | undefined {
    if (input.match(NOSTR_BECH32_REGEXP)) {
        return nip19ToTag(input);
    } else {
        let tag: NDKTag | undefined = undefined;
        // Handle hashtags (e.g. "#bitcoin")
        if (input.startsWith("#")) tag = ["t", input.substring(1)];
        // Handle URLs
        if (input.match(/https?:\/\//)) tag = ["r", input];
        // Handle relay URLs
        if (input.match(/wss?:\/\//)) {
            if (listKind !== NDKKind.RelayList) {
                tag = ["relay", input];
            } else {
                tag = ["r", input];
            }
        }
        // Handle emojis
        if (input.match(/:.*:,\s?https?:\/\/.*/)) {
            const shortcode = input.split(",")[0].replace(":", "").trim();
            const url = input.split(",")[1].trim();
            return ["emoji", shortcode, url];
        }
        // Add any markers to the tag
        if (tag && markers && markers.length > 0) tag = [...tag, ...markers];
        return tag;
    }
}

export function aTagToNip19(aTag: NDKTag): string {
    if (aTag[0] !== "a") throw new Error("Not an a tag");
    const tagIdSplit = aTag[1].split(":");

    return nip19.naddrEncode({
        kind: parseInt(tagIdSplit[0]),
        pubkey: tagIdSplit[1],
        identifier: tagIdSplit[2],
    });
}
