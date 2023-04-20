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
