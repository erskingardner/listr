import { type NDKUser, NDKKind, NDKNip07Signer, NDKEvent } from "@nostr-dev-kit/ndk";
import { writable } from "svelte/store";

const currentUser = writable<NDKUser | null>(null);

// Store the user's current follower list as an array of hexpubkeys
export const currentUserFollows = writable<string[]>([]);
// Store the user's app settings for Listr
export const currentUserSettings = writable<App.UserSettings | null>(null);

/**
 * Fetch the follows for a user, formatted as an array of hexpubkeys
 * @param user the user who you want to fetch follows for
 * @returns an array of hexpubkeys of all the users they follow
 */
export async function fetchUserFollows(user: NDKUser): Promise<string[]> {
    const followsSet = await user.follows();
    return Array.from(followsSet).map((user) => user.hexpubkey);
}

/**
 * Fetch the app specific settings for Listr
 * @param user the user you want to fetch settings for
 * @returns A promise object with the settings or null
 */
export async function fetchUserSettings(user: NDKUser): Promise<App.UserSettings> {
    if (!user || !user.ndk) throw new Error("No logged in user or NDK instance");

    const ndk = user.ndk;
    const settingsEvents = await ndk.fetchEvents({
        kinds: [NDKKind.AppSpecificData],
        authors: [user.hexpubkey],
        "#d": ["listr/settings/v1"],
    });
    const eventsArray = Array.from(settingsEvents);

    let settings: App.UserSettings = { devMode: false };

    if (eventsArray.length === 1) {
        const event: NDKEvent = eventsArray[0] as NDKEvent;
        let signer: NDKNip07Signer;
        if (!ndk.signer) {
            signer = new NDKNip07Signer();
            ndk.signer = signer;
        }
        await event.decrypt(user);
        settings = JSON.parse(event.content);
    } else if (eventsArray.length > 1) {
        console.error("Many settings events", eventsArray);
    }
    return settings;
}

export default currentUser;
