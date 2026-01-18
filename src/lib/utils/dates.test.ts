import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dateTomorrow, formattedDate, timeAgo, unixTimeNowInSeconds } from "./dates";

describe("dates utility functions", () => {
    describe("unixTimeNowInSeconds", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should return current time in seconds", () => {
            const mockDate = new Date("2024-01-15T12:00:00.000Z");
            vi.setSystemTime(mockDate);

            const result = unixTimeNowInSeconds();
            expect(result).toBe(Math.floor(mockDate.getTime() / 1000));
        });

        it("should floor the result (not round)", () => {
            // Set time to something with milliseconds
            const mockDate = new Date("2024-01-15T12:00:00.999Z");
            vi.setSystemTime(mockDate);

            const result = unixTimeNowInSeconds();
            // Should be floored, not rounded
            expect(result).toBe(Math.floor(mockDate.getTime() / 1000));
        });
    });

    describe("dateTomorrow", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should return a date 24 hours from now", () => {
            const mockDate = new Date("2024-01-15T12:00:00.000Z");
            vi.setSystemTime(mockDate);

            const result = dateTomorrow();
            const expected = new Date("2024-01-16T12:00:00.000Z");

            expect(result.getTime()).toBe(expected.getTime());
        });

        it("should return a Date object", () => {
            const result = dateTomorrow();
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe("formattedDate", () => {
        it("should format a Unix timestamp correctly", () => {
            // January 15, 2024 12:00:00 UTC
            const timestamp = 1705320000;
            const result = formattedDate(timestamp);

            // The output depends on locale, but should contain these components
            expect(result).toContain("2024");
            expect(result).toContain("15");
            // Month name varies by locale, just check it's a non-empty string
            expect(result.length).toBeGreaterThan(0);
        });

        it("should handle timestamp 0 (Unix epoch)", () => {
            const result = formattedDate(0);
            // January 1, 1970
            expect(result).toContain("1970");
        });

        it("should format different dates correctly", () => {
            // December 25, 2023
            const christmasTimestamp = 1703462400;
            const result = formattedDate(christmasTimestamp);
            expect(result).toContain("2023");
            expect(result).toContain("25");
        });
    });

    describe("timeAgo", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should return relative time for recent timestamps", () => {
            const now = new Date("2024-01-15T12:00:00.000Z");
            vi.setSystemTime(now);

            // 5 minutes ago
            const fiveMinutesAgo = Math.floor(now.getTime() / 1000) - 300;
            const result = timeAgo(fiveMinutesAgo);

            expect(result).toContain("5");
            expect(result).toContain("minute");
        });

        it("should return relative time for timestamps hours ago", () => {
            const now = new Date("2024-01-15T12:00:00.000Z");
            vi.setSystemTime(now);

            // 2 hours ago
            const twoHoursAgo = Math.floor(now.getTime() / 1000) - 7200;
            const result = timeAgo(twoHoursAgo);

            expect(result).toContain("2");
            expect(result).toContain("hour");
        });

        it("should return relative time for timestamps days ago", () => {
            const now = new Date("2024-01-15T12:00:00.000Z");
            vi.setSystemTime(now);

            // 3 days ago
            const threeDaysAgo = Math.floor(now.getTime() / 1000) - 259200;
            const result = timeAgo(threeDaysAgo);

            expect(result).toContain("3");
            expect(result).toContain("day");
        });
    });
});
