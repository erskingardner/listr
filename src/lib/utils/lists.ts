import type { NDKEvent, NDKList, NDKTag } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { NOSTR_PUBKEY_REGEXP } from "./nostr";

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
};

export const LIST_FILTER_REGEXP = /^(chats|notifications|\/)/;
export const LIST_MUTE_FILTER_REGEXP = /^mute|Mute/;
export const LISTR_NPUB = "npub1lstr2kmdthkgfuzne8e4cn2nhr646x8jt25szdj7t4wr6xemtuuq3lczsj";

export const filterAndSortByTitle = (lists: NDKList[], deletions?: NDKEvent[]) => {
    // Filter blocked users
    const userFiltered = lists.filter((list) => !BLOCKED_PUBKEYS.includes(list.pubkey));

    // Filter by title
    const titleFiltered = userFiltered.filter(
        (list) => list.title && !list.title.match(LIST_FILTER_REGEXP)
    );

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
    let titleFiltered = lists.filter((list) => list.title && !list.title.match(LIST_FILTER_REGEXP));

    if (filterMute) {
        titleFiltered = titleFiltered.filter(
            (list) => list.title && !list.title.match(LIST_MUTE_FILTER_REGEXP)
        );
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
    const dedupedArr: NDKTag[] = [];
    for (const item of itemsArray) {
        const dupes = dedupedArr.filter(
            (dedupedItem) => dedupedItem[0] === item[0] && dedupedItem[1] === item[1]
        );
        if (dupes.length === 0) dedupedArr.push(item);
    }
    return dedupedArr;
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
            return "NIP-19 identifier (npub, nprofile, note, nevent), a hashtag (e.g. #NSFW), or a word (e.g. Bitcoin)";
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
            return "NIP-19 pubkey identifier (npub or nprofile)";
        case 30004:
            return "Note or event NIP-19 identifier (note, nevent, naddr)";
        case 30015:
            return "Hashtag (e.g. #climbing)";
        case 30030:
            return "Comma-separated shortcode and url to an emoji (e.g. :smile:, https://example.com/smile.png)";
        default:
            return "";
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
