import type { NDKEvent, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { describe, expect, it } from "vitest";
import { isEventNsfw, isProfileNsfw } from "./nsfw";

/**
 * Helper to create a mock NDKEvent with tags
 */
function createMockEvent(tags: string[][]): NDKEvent {
    return { tags } as unknown as NDKEvent;
}

describe("nsfw utility functions", () => {
    describe("isEventNsfw", () => {
        it("should return false for null/undefined event", () => {
            expect(isEventNsfw(null)).toBe(false);
            expect(isEventNsfw(undefined)).toBe(false);
        });

        it("should return false for event with no tags", () => {
            const event = createMockEvent([]);
            expect(isEventNsfw(event)).toBe(false);
        });

        it("should return true for event with content-warning tag", () => {
            const event = createMockEvent([["content-warning", "NSFW content"]]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should return true for event with content-warning tag (no reason)", () => {
            const event = createMockEvent([["content-warning"]]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should return true for event with nsfw label", () => {
            const event = createMockEvent([
                ["L", "content-warning"],
                ["l", "nsfw", "content-warning"],
            ]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should return true for event with nudity label", () => {
            const event = createMockEvent([["l", "nudity", "content-warning"]]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should return true for event with adult label", () => {
            const event = createMockEvent([["l", "adult"]]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should return true for event with NS-nud label (nos.social ontology)", () => {
            const event = createMockEvent([
                ["L", "social.nos.ontology"],
                ["l", "NS-nud", "social.nos.ontology"],
            ]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should return true for event with porn label", () => {
            const event = createMockEvent([["l", "porn"]]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should return true for event with explicit label", () => {
            const event = createMockEvent([["l", "explicit"]]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should return false for event with unrelated labels", () => {
            const event = createMockEvent([
                ["L", "ISO-3166-2"],
                ["l", "IT-MI", "ISO-3166-2"],
            ]);
            expect(isEventNsfw(event)).toBe(false);
        });

        it("should return false for event with only p and e tags", () => {
            const event = createMockEvent([
                ["p", "somepubkey"],
                ["e", "someeventid"],
            ]);
            expect(isEventNsfw(event)).toBe(false);
        });

        it("should be case-insensitive for tag names", () => {
            const event = createMockEvent([["Content-Warning", "test"]]);
            expect(isEventNsfw(event)).toBe(true);
        });

        it("should be case-insensitive for label values", () => {
            const event = createMockEvent([["l", "NSFW"]]);
            expect(isEventNsfw(event)).toBe(true);
        });
    });

    describe("isProfileNsfw", () => {
        it("should return false for null/undefined profile", () => {
            expect(isProfileNsfw(null)).toBe(false);
            expect(isProfileNsfw(undefined)).toBe(false);
        });

        it("should return true for profile with nsfw field set to 'true'", () => {
            const profile = { nsfw: "true" } as unknown as NDKUserProfile;
            expect(isProfileNsfw(profile)).toBe(true);
        });

        it("should return true for profile with nsfw field set to '1'", () => {
            const profile = { nsfw: "1" } as unknown as NDKUserProfile;
            expect(isProfileNsfw(profile)).toBe(true);
        });

        it("should return true for profile with nsfw field set to 1 (number)", () => {
            const profile = { nsfw: 1 } as unknown as NDKUserProfile;
            expect(isProfileNsfw(profile)).toBe(true);
        });

        it("should return false for profile with nsfw field set to 'false'", () => {
            const profile = { nsfw: "false" } as unknown as NDKUserProfile;
            expect(isProfileNsfw(profile)).toBe(false);
        });

        it("should return false for profile with nsfw field set to 0", () => {
            const profile = { nsfw: 0 } as unknown as NDKUserProfile;
            expect(isProfileNsfw(profile)).toBe(false);
        });

        it("should return false for profile without nsfw field", () => {
            const profile = {
                name: "Test User",
                about: "Just a test",
            } as unknown as NDKUserProfile;
            expect(isProfileNsfw(profile)).toBe(false);
        });

        it("should check profileEvent tags if provided", () => {
            const profile = { name: "Test" } as unknown as NDKUserProfile;
            const profileEvent = createMockEvent([["content-warning", "adult content"]]);
            expect(isProfileNsfw(profile, profileEvent)).toBe(true);
        });

        it("should return true if either profile field or event tags indicate NSFW", () => {
            // Profile field indicates NSFW
            const profile1 = { nsfw: "true" } as unknown as NDKUserProfile;
            const nonNsfwEvent = createMockEvent([]);
            expect(isProfileNsfw(profile1, nonNsfwEvent)).toBe(true);

            // Event tags indicate NSFW
            const profile2 = {} as unknown as NDKUserProfile;
            const nsfwEvent = createMockEvent([["content-warning"]]);
            expect(isProfileNsfw(profile2, nsfwEvent)).toBe(true);
        });

        it("should return false if profile field is not NSFW and no event provided", () => {
            const profile = { nsfw: "false" } as unknown as NDKUserProfile;
            expect(isProfileNsfw(profile)).toBe(false);
        });

        it("should handle null profileEvent gracefully", () => {
            const profile = { name: "Test" } as unknown as NDKUserProfile;
            expect(isProfileNsfw(profile, null)).toBe(false);
        });
    });
});
