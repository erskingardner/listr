import type { NDKEvent, NDKUserProfile } from "@nostr-dev-kit/ndk";

/**
 * Common NSFW-related label values used in NIP-32 labeling
 */
const NSFW_LABELS = [
    "nsfw",
    "nudity",
    "adult",
    "explicit",
    "porn",
    "pornography",
    "NS-nud", // social.nos.ontology nudity label
    "sexual",
];

/**
 * Checks if an NDK event (typically kind 0 profile) is marked as NSFW/sensitive content.
 *
 * Detection methods (per NIP-36 and NIP-32):
 * 1. Has `content-warning` tag
 * 2. Has `L` tag with "content-warning" namespace and corresponding `l` tag
 * 3. Has `l` tag with NSFW-related labels
 *
 * @param event - The NDK event to check (usually the profileEvent from NDKUser)
 * @returns true if the event is marked as NSFW/sensitive
 */
export function isEventNsfw(event: NDKEvent | null | undefined): boolean {
    if (!event?.tags) return false;

    for (const tag of event.tags) {
        const tagName = tag[0]?.toLowerCase();
        const tagValue = tag[1]?.toLowerCase();

        // NIP-36: Check for content-warning tag
        if (tagName === "content-warning") {
            return true;
        }

        // NIP-32: Check for label tags with NSFW-related values
        if (tagName === "l" && tagValue) {
            if (NSFW_LABELS.some((label) => tagValue.includes(label.toLowerCase()))) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Checks if a user profile is marked as NSFW.
 *
 * Detection methods:
 * 1. Check profile metadata for `nsfw` field (some clients set this)
 * 2. Check the raw profile event tags (NIP-36/NIP-32)
 *
 * @param profile - The user profile metadata
 * @param profileEvent - The raw kind 0 event (optional, for tag-based detection)
 * @returns true if the profile is marked as NSFW
 */
export function isProfileNsfw(
    profile: NDKUserProfile | null | undefined,
    profileEvent?: NDKEvent | null
): boolean {
    // Check profile metadata for NSFW field
    // NDKUserProfile allows arbitrary fields via [key: string]: string | number | undefined
    if (profile) {
        const nsfwValue = profile.nsfw;
        if (nsfwValue === "true" || nsfwValue === 1 || nsfwValue === "1") {
            return true;
        }
    }

    // Check the raw event tags
    if (profileEvent) {
        return isEventNsfw(profileEvent);
    }

    return false;
}
