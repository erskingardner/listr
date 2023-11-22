import ndk from "$lib/stores/ndk";
import type { NDKUserParams } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import type { ProfilePointer } from "nostr-tools/libs/nip19";
import { get } from "svelte/store";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
    const userId = params.userId;
    const ndkUserOpts: NDKUserParams = {};
    if (userId.match(/^npub1/)) {
        ndkUserOpts.npub = userId;
    } else if (userId.match(/^nprofile1/)) {
        const profile = nip19.decode(userId);
        ndkUserOpts.pubkey = (profile.data as ProfilePointer).pubkey;
    }
    const ndkStore = get(ndk);
    const user = ndkStore.getUser(ndkUserOpts);
    const profile = await user.fetchProfile();

    return {
        pubkey: user.pubkey,
        npub: user.npub,
        profile,
    };
};
