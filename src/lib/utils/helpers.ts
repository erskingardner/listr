import { nip19 } from 'nostr-tools';

export function unixTimeNow() {
    return Math.floor(new Date().getTime() / 1000);
}

export async function copyToClipboard(textToCopy: string) {
    try {
        await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

export function pointerForList(list: App.List) {
    switch (list.kind) {
        case 10000:
        case 10001:
            return nip19.noteEncode(list.listId);
        case 30000:
        case 30001:
            return nip19.naddrEncode({
                identifier: list.name,
                kind: list.kind,
                pubkey: list.authorHexPubkey
            });
        default:
            break;
    }
}
