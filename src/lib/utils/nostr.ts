import {
    NDKKind,
    type NDKTag,
    type NDKUser,
    type NDKUserParams,
    type NDKUserProfile,
} from "@nostr-dev-kit/ndk";
import { nip05, nip19 } from "nostr-tools";
import type { ProfilePointer } from "nostr-tools/nip19";
import { ndkStore } from "$lib/stores/ndk.svelte";

export const NOSTR_BECH32_REGEXP =
    /^(npub|nprofile|note|nevent|naddr)1[023456789acdefghjklmnpqrstuvwxyz]+/;
export const NOSTR_PUBKEY_REGEXP = /^[0-9a-fA-F]{64}$/;
export const NIP05_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    }
}

export async function stringInputToTag(
    input: string,
    listKind: number,
    markers?: string[]
): Promise<NDKTag | undefined> {
    if (input.match(NOSTR_BECH32_REGEXP)) {
        return nip19ToTag(input);
    }

    let tag: NDKTag | undefined;
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
    // Handle NIP-05
    if (input.match(NIP05_REGEXP)) {
        const profile = await nip05.queryProfile(input);
        if (profile?.pubkey) {
            tag = ["p", profile.pubkey];
        }
    }
    // Add any markers to the tag
    if (tag && markers && markers.length > 0) tag = [...tag, ...markers];
    return tag;
}

export function aTagToNip19(aTag: NDKTag): string {
    if (aTag[0] !== "a") throw new Error("Not an a tag");
    const tagIdSplit = aTag[1].split(":");

    return nip19.naddrEncode({
        kind: Number.parseInt(tagIdSplit[0], 10),
        pubkey: tagIdSplit[1],
        identifier: tagIdSplit[2],
    });
}

export async function getUserAndProfile(userIdentifier: string): Promise<{
    user: NDKUser;
    profile: NDKUserProfile | null;
}> {
    const ndkUserOpts: NDKUserParams = {};
    if (userIdentifier.match(/^npub1/)) {
        ndkUserOpts.npub = userIdentifier;
    } else if (userIdentifier.match(/^nprofile1/)) {
        const profile = nip19.decode(userIdentifier);
        ndkUserOpts.pubkey = (profile.data as ProfilePointer).pubkey;
    }

    const user = ndkStore.getUser(ndkUserOpts);
    const profile = await user.fetchProfile();
    return { user, profile };
}
