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

export const filterAndSortByName = (lists: NDKList[], deletions?: NDKEvent[]) => {
    const userFiltered = lists.filter((list) => !BLOCKED_PUBKEYS.includes(list.pubkey));
    const nameFiltered = userFiltered.filter(
        (list) => list.name && !list.name.match(LIST_FILTER_REGEXP)
    );
    let deleteFiltered;
    if (deletions) {
        deleteFiltered = nameFiltered.filter(
            (list) =>
                !deletions
                    .map((event) => event.tagValue("a") || event.tagValue("e"))
                    .includes(list.tagId())
        );
    }
    const sorted = (deleteFiltered || nameFiltered).sort((a, b) => a.name!.localeCompare(b.name!));
    return sorted;
};

export const filteredLists = (
    lists: NDKList[],
    deletions?: NDKEvent[],
    filterMute: boolean = false
) => {
    let nameFiltered = lists.filter((list) => list.name && !list.name.match(LIST_FILTER_REGEXP));

    if (filterMute) {
        nameFiltered = nameFiltered.filter(
            (list) => list.name && !list.name.match(LIST_MUTE_FILTER_REGEXP)
        );
    }

    let deleteFiltered;
    if (deletions) {
        deleteFiltered = nameFiltered.filter(
            (list) =>
                !deletions.map((event) => event.tagValue("a")).includes(list.tagId()) ||
                !deletions.map((event) => event.tagValue("e")).includes(list.id)
        );
    }

    return deleteFiltered || nameFiltered;
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
