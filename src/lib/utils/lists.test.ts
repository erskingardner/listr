import type { NDKTag } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { describe, expect, it } from "vitest";
import {
    deduplicateItems,
    filteredItemsForListKind,
    ITEM_TYPES_FOR_LIST_KINDS,
    kindIsRelayList,
    placeholderForListKind,
    SUPPORTED_LIST_KINDS,
    validateTagForListKind,
} from "./lists";

describe("lists utility functions", () => {
    describe("deduplicateItems", () => {
        it("should remove duplicate items", () => {
            const items: NDKTag[] = [
                ["p", "pubkey1"],
                ["p", "pubkey1"],
                ["p", "pubkey2"],
            ];
            const result = deduplicateItems(items);
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                ["p", "pubkey1"],
                ["p", "pubkey2"],
            ]);
        });

        it("should return empty array for empty input", () => {
            const result = deduplicateItems([]);
            expect(result).toEqual([]);
        });

        it("should keep items with same tag type but different values", () => {
            const items: NDKTag[] = [
                ["e", "event1"],
                ["e", "event2"],
                ["p", "pubkey1"],
            ];
            const result = deduplicateItems(items);
            expect(result).toHaveLength(3);
        });
    });

    describe("filteredItemsForListKind", () => {
        it("should filter items for FollowSet (kind 30000) to only p tags", () => {
            const items: NDKTag[] = [
                ["p", "pubkey1"],
                ["e", "event1"],
                ["t", "hashtag"],
            ];
            const result = filteredItemsForListKind(items, 30000);
            expect(result).toEqual([["p", "pubkey1"]]);
        });

        it("should return all items for kinds with undefined filter", () => {
            const items: NDKTag[] = [
                ["p", "pubkey1"],
                ["e", "event1"],
                ["word", "something"],
            ];
            // Kind 10000 (MuteList) allows everything
            const result = filteredItemsForListKind(items, 10000);
            expect(result).toEqual(items);
        });

        it("should filter bookmark list items correctly", () => {
            const items: NDKTag[] = [
                ["e", "event1"],
                ["a", "address1"],
                ["t", "hashtag"],
                ["r", "url"],
                ["p", "pubkey1"],
            ];
            // Kind 10003 (BookmarkList) allows e, a, t, r
            const result = filteredItemsForListKind(items, 10003);
            expect(result).toHaveLength(4);
            expect(result.map((i) => i[0])).toEqual(["e", "a", "t", "r"]);
        });
    });

    describe("validateTagForListKind", () => {
        it("should return true for valid tag types", () => {
            expect(validateTagForListKind(["p", "pubkey1"], 30000)).toBe(true);
            expect(validateTagForListKind(["e", "event1"], 10001)).toBe(true);
            expect(validateTagForListKind(["relay", "wss://relay.example.com"], 10006)).toBe(true);
        });

        it("should return false for invalid tag types", () => {
            expect(validateTagForListKind(["e", "event1"], 30000)).toBe(false);
            expect(validateTagForListKind(["p", "pubkey1"], 10001)).toBe(false);
        });

        it("should return true for kinds without restrictions", () => {
            expect(validateTagForListKind(["anything", "value"], 10000)).toBe(true);
        });
    });

    describe("placeholderForListKind", () => {
        it("should return appropriate placeholder for relay lists", () => {
            const placeholder = placeholderForListKind(10002);
            expect(placeholder).toContain("Relay");
            expect(placeholder).toContain("wss://");
        });

        it("should return appropriate placeholder for follow sets", () => {
            const placeholder = placeholderForListKind(30000);
            expect(placeholder).toContain("npub");
        });

        it("should return empty string for unknown kinds", () => {
            expect(placeholderForListKind(99999)).toBe("");
        });
    });

    describe("kindIsRelayList", () => {
        it("should return true for relay list kinds", () => {
            expect(kindIsRelayList(NDKKind.RelayList)).toBe(true);
            expect(kindIsRelayList(NDKKind.BlockRelayList)).toBe(true);
            expect(kindIsRelayList(NDKKind.SearchRelayList)).toBe(true);
            expect(kindIsRelayList(NDKKind.RelaySet)).toBe(true);
            expect(kindIsRelayList(10050)).toBe(true);
            expect(kindIsRelayList(10051)).toBe(true);
        });

        it("should return false for non-relay list kinds", () => {
            expect(kindIsRelayList(NDKKind.Contacts)).toBe(false);
            expect(kindIsRelayList(NDKKind.MuteList)).toBe(false);
            expect(kindIsRelayList(NDKKind.BookmarkList)).toBe(false);
        });
    });

    describe("SUPPORTED_LIST_KINDS", () => {
        it("should include common list kinds", () => {
            expect(SUPPORTED_LIST_KINDS).toContain(NDKKind.Contacts);
            expect(SUPPORTED_LIST_KINDS).toContain(NDKKind.MuteList);
            expect(SUPPORTED_LIST_KINDS).toContain(NDKKind.BookmarkList);
            expect(SUPPORTED_LIST_KINDS).toContain(NDKKind.FollowSet);
        });
    });

    describe("ITEM_TYPES_FOR_LIST_KINDS", () => {
        it("should have correct item types for known kinds", () => {
            expect(ITEM_TYPES_FOR_LIST_KINDS[30000]).toEqual(["p"]);
            expect(ITEM_TYPES_FOR_LIST_KINDS[10001]).toEqual(["e"]);
            expect(ITEM_TYPES_FOR_LIST_KINDS[10002]).toEqual(["r"]);
        });
    });
});
