import type { NDKEvent, NDKList, NDKTag } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";

export const SUPPORTED_LIST_KINDS = [
    NDKKind.Contacts,
    NDKKind.MuteList,
    NDKKind.PinList,
    NDKKind.RelayList,
    NDKKind.CategorizedBookmarkList,
    NDKKind.CategorizedPeopleList,
    NDKKind.CategorizedRelayList,
    NDKKind.InterestsList,
    NDKKind.CategorizedHighlightList,
];

export const FEED_LIST_KINDS = [
    NDKKind.CategorizedBookmarkList,
    NDKKind.CategorizedPeopleList,
    NDKKind.CategorizedRelayList,
    NDKKind.InterestsList,
    NDKKind.CategorizedHighlightList,
];

export const DUPLICATABLEABLE_LIST_KINDS = [
    NDKKind.CategorizedBookmarkList,
    NDKKind.CategorizedPeopleList,
    NDKKind.CategorizedRelayList,
    NDKKind.InterestsList,
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
