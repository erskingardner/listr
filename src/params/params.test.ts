import { describe, expect, it } from "vitest";
import { match as matchEvent } from "./event";
import { match as matchPre } from "./pre";
import { match as matchUser } from "./user";

describe("route param matchers", () => {
    describe("event matcher", () => {
        it("should match valid nevent identifiers", () => {
            expect(matchEvent("nevent1abc123xyz")).toBe(true);
            expect(matchEvent("nevent1qqqqqqqqqqqqqqqqqqqqqqqq")).toBe(true);
        });

        it("should match valid note identifiers", () => {
            expect(matchEvent("note1abc123xyz")).toBe(true);
            expect(matchEvent("note1qqqqqqqqqqqqqqqqqqqqqqqq")).toBe(true);
        });

        it("should not match invalid identifiers", () => {
            expect(matchEvent("npub1abc123")).toBe(false);
            expect(matchEvent("naddr1abc123")).toBe(false);
            expect(matchEvent("invalid")).toBe(false);
            expect(matchEvent("")).toBe(false);
            expect(matchEvent("event1abc")).toBe(false);
        });

        it("should match identifiers even with trailing invalid characters", () => {
            // The regex /^(nevent1|note1)[a-zA-Z0-9]*/ only validates the prefix
            // and allows any alphanumeric chars after, but special chars after are matched
            // because * matches zero or more - the regex succeeds on the prefix portion
            expect(matchEvent("nevent1abc!@#")).toBe(true); // Matches nevent1abc, ignores rest
            expect(matchEvent("note1abc")).toBe(true);
        });

        it("should match even when space is present after valid prefix", () => {
            // The regex /^(nevent1|note1)[a-zA-Z0-9]*/ matches the prefix portion
            // The * means "zero or more" so note1abc matches, and the rest is ignored
            expect(matchEvent("note1abc def")).toBe(true);
        });
    });

    describe("pre (naddr) matcher", () => {
        it("should match valid naddr identifiers", () => {
            expect(matchPre("naddr1abc123xyz")).toBe(true);
            expect(matchPre("naddr1qqqqqqqqqqqqqqqqqqqqqqqq")).toBe(true);
        });

        it("should not match other NIP-19 identifiers", () => {
            expect(matchPre("npub1abc123")).toBe(false);
            expect(matchPre("note1abc123")).toBe(false);
            expect(matchPre("nevent1abc123")).toBe(false);
        });

        it("should not match invalid identifiers", () => {
            expect(matchPre("invalid")).toBe(false);
            expect(matchPre("")).toBe(false);
            expect(matchPre("addr1abc")).toBe(false);
        });

        it("should match identifiers even with trailing invalid characters", () => {
            // The regex matches the prefix portion even with trailing special chars
            expect(matchPre("naddr1abc!@#")).toBe(true); // Matches naddr1abc
        });
    });

    describe("user matcher", () => {
        it("should match valid npub identifiers", () => {
            expect(matchUser("npub1abc123xyz")).toBe(true);
            expect(matchUser("npub1qqqqqqqqqqqqqqqqqqqqqqqq")).toBe(true);
        });

        it("should match valid nprofile identifiers", () => {
            expect(matchUser("nprofile1abc123xyz")).toBe(true);
            expect(matchUser("nprofile1qqqqqqqqqqqqqqqqqqqqqqqq")).toBe(true);
        });

        it("should not match other NIP-19 identifiers", () => {
            expect(matchUser("note1abc123")).toBe(false);
            expect(matchUser("nevent1abc123")).toBe(false);
            expect(matchUser("naddr1abc123")).toBe(false);
        });

        it("should not match invalid identifiers", () => {
            expect(matchUser("invalid")).toBe(false);
            expect(matchUser("")).toBe(false);
            expect(matchUser("pub1abc")).toBe(false);
        });

        it("should match identifiers even with trailing invalid characters", () => {
            // The regex matches the prefix portion even with trailing special chars
            expect(matchUser("npub1abc!@#")).toBe(true); // Matches npub1abc
        });

        it("should match even when space is present after valid prefix", () => {
            // The regex matches the prefix portion - nprofile1abc matches
            expect(matchUser("nprofile1abc def")).toBe(true);
        });
    });
});
