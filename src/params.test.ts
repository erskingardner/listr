import { describe, expect, it } from "vitest";
import { params } from "./params";

describe("SvelteKit route parameter registration", () => {
    it.each([
        ["event", "nevent1abc123"],
        ["event", "note1abc123"],
        ["nip19", "nevent1abc123"],
        ["nip19", "naddr1abc123"],
        ["pre", "naddr1abc123"],
        ["user", "npub1abc123"],
        ["user", "nprofile1abc123"],
    ] as const)("preserves %s identifier %s", async (matcher, value) => {
        expect(await params[matcher]["~standard"].validate(value)).toEqual({ value });
    });

    it.each(["event", "nip19", "pre", "user"] as const)(
        "rejects invalid %s identifiers",
        async (matcher) => {
            expect(await params[matcher]["~standard"].validate("invalid")).toHaveProperty("issues");
        }
    );
});
