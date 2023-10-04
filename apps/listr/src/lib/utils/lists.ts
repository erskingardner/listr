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

export const LIST_FILTER_REGEXP = /^(chats|notifications|\/)/;
export const LIST_MUTE_FILTER_REGEXP = /^mute|Mute/;

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
