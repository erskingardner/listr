import type { NDKEvent, NDKList, NDKTag } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { NOSTR_PUBKEY_REGEXP } from "./nostr";

/**
 * Fallback titles for list kinds that NDK doesn't provide defaults for.
 * Used when a list has no title/name tag.
 */
export const KIND_FALLBACK_TITLES: Record<number, string> = {
    [NDKKind.FollowSet]: "Follow Set",
    [NDKKind.CategorizedBookmarkList]: "Categorized Bookmarks",
    [NDKKind.RelaySet]: "Relay Set",
    [NDKKind.BookmarkSet]: "Bookmark Set",
    [NDKKind.ArticleCurationSet]: "Article Curation Set",
    [NDKKind.InterestSet]: "Interest Set",
    [NDKKind.EmojiSet]: "Emoji Set",
    [NDKKind.HighlightSet]: "Highlight Set",
    10050: "Inbox Relays",
    10051: "Key Package Relays",
    39089: "Starter Pack",
};

/**
 * Pattern to detect non-human-readable d-tag values used as titles.
 * Matches:
 * - Kind identifiers like "30023:pubkey..." (addressable event references)
 * - Base64-like strings (url:aHR0..., aHR0...)
 * - Long hex strings (40+ chars of hex)
 */
const NON_READABLE_TITLE_REGEXP = /^(\d{5}:[a-f0-9]|url:|aHR0|[a-f0-9]{40,})/i;

/**
 * NDK's default titles that we want to override with our own.
 */
const NDK_DEFAULT_TITLES_TO_OVERRIDE: Record<string, number> = {
    "Direct Message Receive Relays": 10050,
};

/**
 * Extracts a title from decrypted tags.
 * NIP-51 allows the "title" tag to be in encrypted content for fully private lists.
 */
export function getTitleFromTags(tags: NDKTag[]): string | undefined {
    const titleTag = tags.find((tag) => tag[0] === "title");
    return titleTag?.[1];
}

/**
 * Gets a display-friendly title for a list.
 * Falls back to kind-specific defaults if the title appears to be a raw identifier.
 * For lists with encrypted content but no public title, returns "Private List" indicator.
 *
 * @param list - The list to get the title for
 * @param decryptedTags - Optional decrypted tags (for extracting encrypted title)
 */
export function getListDisplayTitle(list: NDKList, decryptedTags?: NDKTag[]): string {
    // First check for title in decrypted tags (for fully private lists)
    if (decryptedTags) {
        const encryptedTitle = getTitleFromTags(decryptedTags);
        if (encryptedTitle && !NON_READABLE_TITLE_REGEXP.test(encryptedTitle)) {
            return encryptedTitle;
        }
    }

    const title = list.title;
    const kind = list.kind as number;

    // Check if this is an NDK default title we want to override
    if (title && NDK_DEFAULT_TITLES_TO_OVERRIDE[title] === kind) {
        const fallback = KIND_FALLBACK_TITLES[kind];
        if (fallback) {
            return fallback;
        }
    }

    // If no title or title looks like a raw identifier, use fallback
    if (!title || NON_READABLE_TITLE_REGEXP.test(title)) {
        const fallback = KIND_FALLBACK_TITLES[kind];
        if (fallback) {
            return fallback;
        }
        // If no fallback and list has encrypted content, it may be a fully private list
        if (hasEncryptedContent(list)) {
            return "Private List";
        }
    }

    return title || "Untitled List";
}

export const SUPPORTED_LIST_KINDS = [
    // 10000-19999: Lists
    NDKKind.Contacts,
    NDKKind.MuteList,
    NDKKind.PinList,
    NDKKind.BookmarkList,
    NDKKind.RelayList,
    NDKKind.CommunityList,
    NDKKind.BlockRelayList,
    NDKKind.SearchRelayList,
    NDKKind.InterestList,
    NDKKind.EmojiList,
    10050, // NIP-17 DM receive relay list
    10051, // NIP-104 Key Package relay list

    // 30000-39999: Categorized Lists
    NDKKind.FollowSet,
    NDKKind.CategorizedBookmarkList, // Deprecated but we'll keep it around for now
    NDKKind.RelaySet,
    NDKKind.BookmarkSet,
    NDKKind.ArticleCurationSet,
    NDKKind.InterestSet,
    NDKKind.EmojiSet,
    NDKKind.HighlightSet,
    39089, // Starter Pack
];

// What shows up in the feed
export const FEED_LIST_KINDS = [
    NDKKind.PinList,
    NDKKind.BookmarkList,
    NDKKind.CommunityList,
    NDKKind.InterestList,
    NDKKind.EmojiList,

    NDKKind.FollowSet,
    NDKKind.CategorizedBookmarkList,
    NDKKind.BookmarkSet,
    NDKKind.ArticleCurationSet,
    NDKKind.InterestSet,
    NDKKind.EmojiSet,
    NDKKind.HighlightSet,
    39089, // Starter Pack
];

export const DUPLICATABLEABLE_LIST_KINDS = [
    NDKKind.FollowSet,
    NDKKind.CategorizedBookmarkList,
    NDKKind.RelaySet,
    NDKKind.BookmarkSet,
    NDKKind.ArticleCurationSet,
    NDKKind.InterestSet,
    NDKKind.EmojiSet,
    NDKKind.HighlightSet,
    39089, // Starter Pack
];

export const BLOCKED_PUBKEYS = [
    // Primal Algos user - automated
    "5d8282fc89410f1c57681a2c3b8be57afd1566c262fd1deb543999d39d141cb4",
];

type AllowedItemsForListKind = {
    [kind: number]: string[] | undefined;
};

export const ITEM_TYPES_FOR_LIST_KINDS: AllowedItemsForListKind = {
    10000: undefined, // Need to allow everything through because of bare words
    10001: ["e"],
    10002: ["r"],
    10003: ["e", "a", "t", "r"],
    10004: ["a"],
    10005: ["e"],
    10006: ["relay"],
    10007: ["relay"],
    10015: ["t", "a"],
    10030: ["emoji", "a"],
    10050: ["relay"],
    10051: ["relay"],
    30000: ["p"],
    30001: undefined, // Deprecated, for now just return the full array
    30002: ["relay"],
    30003: ["e", "a", "t", "r"],
    30004: ["a", "e"],
    30015: ["t"],
    30030: ["emoji"],
    39089: ["p"],
};

export const LIST_FILTER_REGEXP = /^(chats|notifications|\/)/;
export const LIST_MUTE_FILTER_REGEXP = /^mute|Mute/;
export const LISTR_NPUB = "npub1lstr2kmdthkgfuzne8e4cn2nhr646x8jt25szdj7t4wr6xemtuuq3lczsj";

/**
 * Checks if a list has encrypted content that may contain private tags.
 * Lists with encrypted content should not be filtered out even if they lack a public title,
 * as the title may be encrypted (for "fully private" lists created by clients like Gossip).
 */
export function hasEncryptedContent(list: NDKList): boolean {
    return list.content !== undefined && list.content.length > 0;
}

/**
 * Checks if a list's title matches unwanted patterns (chats, notifications, etc.)
 * This checks the title property which NDK may derive from the d tag.
 */
function shouldFilterByTitle(list: NDKList): boolean {
    const title = list.title;
    if (!title) return false;
    return LIST_FILTER_REGEXP.test(title);
}

export const filterAndSortByTitle = (lists: NDKList[], deletions?: NDKEvent[]) => {
    // Filter blocked users
    const userFiltered = lists.filter((list) => !BLOCKED_PUBKEYS.includes(list.pubkey));

    // Filter by title - but keep lists with encrypted content (may have encrypted title)
    // However, still filter out lists with unwanted title patterns (chats, notifications, etc.)
    const titleFiltered = userFiltered.filter((list) => {
        // Always filter out lists with unwanted title patterns
        if (shouldFilterByTitle(list)) {
            return false;
        }
        // Keep if has a valid title or has encrypted content (may have encrypted title)
        return list.title || hasEncryptedContent(list);
    });

    // Remove duplicates by list.id (keep the most recent version)
    const uniqueById = titleFiltered.reduce((acc, current) => {
        const existing = acc.get(current.id);
        if (!existing || (current.created_at ?? 0) > (existing.created_at ?? 0)) {
            acc.set(current.id, current);
        }
        return acc;
    }, new Map<string, NDKList>());

    // Remove duplicates by kind (keep only the most recent version)
    const uniqueFiltered = filterLatestUniqueKindEvents([...uniqueById.values()]);

    // Filter deletions if provided
    let deleteFiltered: NDKList[] | undefined;
    if (deletions) {
        deleteFiltered = uniqueFiltered.filter(
            (list) =>
                !deletions
                    .map((event) => event.tagValue("a") || event.tagValue("e"))
                    .includes(list.tagId())
        );
    }

    // Sort by title
    const sorted = (deleteFiltered || uniqueFiltered).sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
    );

    return sorted;
};

// Add this constant with the kinds that should be unique
export const UNIQUE_LIST_KINDS = [
    NDKKind.Contacts,
    NDKKind.MuteList,
    NDKKind.PinList,
    NDKKind.RelayList,
    NDKKind.BookmarkList,
    NDKKind.CommunityList,
    NDKKind.BlockRelayList,
    NDKKind.SearchRelayList,
    NDKKind.InterestList,
    NDKKind.EmojiList,
    10050, // NIP-17 DM receive relay list
    10051, // NIP-104 Key Package relay list
];

function filterLatestUniqueKindEvents(events: NDKList[]): NDKList[] {
    // Object to store the latest event for each unique kind
    const latestEventsByKind: { [kind: number]: NDKList } = {};

    // Filter out events of unique kinds and find the latest one for each kind
    const filteredEvents = events.filter((event) => {
        if (!UNIQUE_LIST_KINDS.includes(event.kind as number)) {
            return true;
        }

        if (
            !latestEventsByKind[event.kind as number] ||
            (event.created_at ?? 0) > (latestEventsByKind[event.kind as number].created_at ?? 0)
        ) {
            latestEventsByKind[event.kind as number] = event;
        }

        return false;
    });

    // Add the latest event for each unique kind back to the filtered list
    for (const event of Object.values(latestEventsByKind)) {
        filteredEvents.push(event);
    }

    return filteredEvents;
}

export const filteredLists = (lists: NDKList[], deletions?: NDKEvent[], filterMute = false) => {
    // Filter by title - but keep lists with encrypted content (may have encrypted title)
    // However, still filter out lists with unwanted title patterns (chats, notifications, etc.)
    let titleFiltered = lists.filter((list) => {
        // Always filter out lists with unwanted title patterns
        if (shouldFilterByTitle(list)) {
            return false;
        }
        // Keep if has a valid title or has encrypted content (may have encrypted title)
        return list.title || hasEncryptedContent(list);
    });

    if (filterMute) {
        titleFiltered = titleFiltered.filter((list) => {
            // If list has a title, check if it matches mute pattern
            if (list.title) {
                return !list.title.match(LIST_MUTE_FILTER_REGEXP);
            }
            // If no title but has encrypted content, keep it (can't know if it's a mute list)
            return hasEncryptedContent(list);
        });
    }

    let deleteFiltered: NDKList[] | undefined;
    if (deletions) {
        deleteFiltered = titleFiltered.filter(
            (list) =>
                !deletions.map((event) => event.tagValue("a")).includes(list.tagId()) ||
                !deletions.map((event) => event.tagValue("e")).includes(list.id)
        );
    }

    return deleteFiltered || titleFiltered;
};

/**
 * Removes duplicate items from an array of NDKTag items.
 * @param itemsArray - An array of NDKTag items to be deduplicated.
 * @returns An array of NDKTag items with duplicates removed. If the input array is empty or contains no duplicates, returns the original array.
 */
export function deduplicateItems(itemsArray: NDKTag[]): NDKTag[] {
    const seen = new Set<string>();
    const result: NDKTag[] = [];
    for (const item of itemsArray) {
        const key = `${item[0]}:${item[1]}`;
        if (!seen.has(key)) {
            seen.add(key);
            result.push(item);
        }
    }
    return result;
}

export function ensurePubkeys(itemsArray: NDKTag[]): NDKTag[] {
    return itemsArray.filter((item) => item[0] === "p" && NOSTR_PUBKEY_REGEXP.test(item[1]));
}

/**
 * Filters an array of NDKTag items based on a specified kind.
 * @param itemsArray - An array of NDKTag items to be filtered.
 * @param kind - The kind of items to filter for. Currently, only kind 30000 (representing "p" items) is supported.
 * @returns An array of NDKTag items that match the specified kind. If the kind is not supported, returns an empty array.
 */
export function filteredItemsForListKind(itemsArray: NDKTag[], kind: number): NDKTag[] {
    const filterItems = ITEM_TYPES_FOR_LIST_KINDS[kind];
    if (filterItems === undefined) {
        return itemsArray;
    }
    return itemsArray.filter((item) => filterItems.includes(item[0]));
}

/**
 * Validates a tag for a specific list kind.
 * @param tag - The NDKTag to be validated.
 * @param kind - The kind of list to validate the tag for.
 * @returns A boolean indicating whether the tag is valid for the specified list kind. If the kind is not found in the ITEM_TYPES_FOR_LIST_KINDS object, returns true.
 */
export function validateTagForListKind(tag: NDKTag, kind: number): boolean {
    const filterItems = ITEM_TYPES_FOR_LIST_KINDS[kind];
    if (filterItems === undefined) {
        return true;
    }
    return filterItems.includes(tag[0]);
}

/**
 * Returns a placeholder string for a specific list kind.
 * @param kind - The kind of list for which to get the placeholder string.
 * @returns A string that can be used as a placeholder for the specified list kind. If the kind is not recognized, returns an empty string.
 */
export function placeholderForListKind(kind: number): string {
    switch (kind) {
        case 10000:
            return "NIP-19 identifier (npub, nprofile, note, nevent), NIP-05 address, hashtag (e.g. #NSFW), or word";
        case 10001:
            return "Note NIP-19 identifier (note or nevent)";
        case 10002:
        case 10006:
        case 10007:
        case 10050:
        case 10051:
        case 30002:
            return "Relay NIP-19 identifier (nrelay) or a relay URL (e.g. wss://relay.damus.io)";
        case 10003:
        case 30003:
            return "Note or event NIP-19 identifier (note, nevent, naddr), a hashtag (e.g. #NSFW), or a URL";
        case 10015:
            return "NIP-19 identifier (naddr) of an Interest Set (kind 30015) or a hashtag (e.g. #NSFW)";
        case 10030:
            return "NIP-19 identifier (naddr) of an Emoji Set (kind 30030) or a comma-separated shortcode and url to an emoji (e.g. :smile:, https://example.com/smile.png)";
        case 30000:
        case 39089:
            return "NIP-19 pubkey identifier (npub or nprofile) or NIP-05 address (e.g. name@domain.com)";
        case 30004:
            return "Note or event NIP-19 identifier (note, nevent, naddr)";
        case 30015:
            return "Hashtag (e.g. #climbing)";
        case 30030:
            return "Comma-separated shortcode and url to an emoji (e.g. :smile:, https://example.com/smile.png)";
        default:
            return "NIP-19 identifier, URL, or text";
    }
}

export function kindIsRelayList(kind: number): boolean {
    return [
        NDKKind.RelayList,
        NDKKind.BlockRelayList,
        NDKKind.SearchRelayList,
        NDKKind.RelaySet,
        10050, // NIP-17 DM receive relay list
        10051, // NIP-104 Key Package relay list
    ].includes(kind);
}
