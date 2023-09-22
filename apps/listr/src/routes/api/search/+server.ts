import ndk from "$lib/stores/ndk";
import { json } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { nip19 } from "nostr-tools";
import { get } from "svelte/store";

export async function GET({ url }) {
    const query = url.searchParams.get("q");
    let value: any;

    if (query?.match(/^(npub1|naddr1|note1)/)) {
        value = nip19.decode(query);

        if (value.type === "npub") {
            throw redirect(308, `/${nip19.npubEncode(value.data)}`);
        } else if (value.type === "naddr") {
            throw redirect(
                308,
                `/${nip19.npubEncode(value.data.pubkey)}/${value.data.kind}/${query}`
            );
        } else if (value.type === "note") {
            const ndkStore = get(ndk);
            const event = await ndkStore.fetchEvent(query);
            if (event) {
                throw redirect(308, `/${nip19.npubEncode(event.pubkey)}/${event.kind}/${query}`);
            }
        }
    }
    return json("Search query doesn't match NIP-19 format", { status: 400 });
}
