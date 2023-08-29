export * from "$lib/utils/dates";
export * from "$lib/utils/lists";
export * from "$lib/utils/nostr";

export async function copyToClipboard(textToCopy: string) {
    try {
        await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
        console.error("Failed to copy: ", err);
    }
}
