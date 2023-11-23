import type { NDKEvent, NDKList, NDKTag } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";

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

    // 30000-39999: Categorized Lists
    NDKKind.FollowSet,
    NDKKind.CategorizedBookmarkList, // Deprecated but we'll keep it around for now
    NDKKind.RelaySet,
    NDKKind.BookmarkSet,
    NDKKind.CurationSet,
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
    NDKKind.CurationSet,
    NDKKind.InterestSet,
    NDKKind.EmojiSet,
    NDKKind.HighlightSet,
];

export const DUPLICATABLEABLE_LIST_KINDS = [
    NDKKind.FollowSet,
    NDKKind.CategorizedBookmarkList,
    NDKKind.RelaySet,
    NDKKind.BookmarkSet,
    NDKKind.CurationSet,
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
    10002: ["relay"],
    10003: ["e", "a", "t", "r"],
    10004: ["a"],
    10005: ["e"],
    10006: ["relay"],
    10007: ["relay"],
    10015: ["t", "a"],
    10030: ["emoji", "a"],
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
    const userFiltered = lists.filter((list) => !BLOCKED_PUBKEYS.includes(list.pubkey));
    const titleFiltered = userFiltered.filter(
        (list) => list.title && !list.title.match(LIST_FILTER_REGEXP)
    );
    let deleteFiltered;
    if (deletions) {
        deleteFiltered = titleFiltered.filter(
            (list) =>
                !deletions
                    .map((event) => event.tagValue("a") || event.tagValue("e"))
                    .includes(list.tagId())
        );
    }
    const sorted = (deleteFiltered || titleFiltered).sort((a, b) =>
        a.title!.localeCompare(b.title!)
    );
    return sorted;
};

export const filteredLists = (
    lists: NDKList[],
    deletions?: NDKEvent[],
    filterMute: boolean = false
) => {
    let titleFiltered = lists.filter((list) => list.title && !list.title.match(LIST_FILTER_REGEXP));

    if (filterMute) {
        titleFiltered = titleFiltered.filter(
            (list) => list.title && !list.title.match(LIST_MUTE_FILTER_REGEXP)
        );
    }

    let deleteFiltered;
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
    itemsArray.forEach((item) => {
        const dupes = dedupedArr.filter(
            (dedupedItem) => dedupedItem[0] === item[0] && dedupedItem[1] === item[1]
        );
        if (dupes.length === 0) dedupedArr.push(item);
    });
    return dedupedArr;
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
