import { describe, it, expect } from "vitest";
import { formatRelativeDate } from "./relative-date.util";

describe("formatRelativeDate", () => {
  const now = new Date(2026, 10, 6, 12);
  const iso = (year: number, month: number, day: number, hour = 12) =>
    new Date(year, month, day, hour).toISOString();

  it.for`
    date                        | expected
    ${iso(2026, 10, 6, 1)}      | ${"today"}
    ${iso(2026, 10, 5, 23)}     | ${"yesterday"}
    ${iso(2026, 10, 7)}         | ${"tomorrow"}
    ${iso(2026, 10, 3)}         | ${"3 days ago"}
    ${iso(2026, 9, 23)}         | ${"2 weeks ago"}
    ${iso(2026, 7, 6)}          | ${"3 months ago"}
    ${iso(2027, 1, 6)}          | ${"in 3 months"}
    ${iso(2024, 10, 6)}         | ${"2 years ago"}
  `("returns $expected for $date", ({ date, expected }) => {
    expect(formatRelativeDate(date, { now, addSuffix: true })).toBe(expected);
  });

  it.for`
    date                        | expected
    ${iso(2026, 10, 6, 1)}      | ${"0 days"}
    ${iso(2026, 10, 5)}         | ${"1 day"}
    ${iso(2026, 10, 3)}         | ${"3 days"}
    ${iso(2026, 9, 23)}         | ${"2 weeks"}
    ${iso(2027, 1, 6)}          | ${"3 months"}
    ${iso(2014, 10, 6)}         | ${"12 years"}
  `("returns $expected for $date without suffix", ({ date, expected }) => {
    expect(formatRelativeDate(date, { now })).toBe(expected);
  });

  it.for([true, false])(
    "throws on an invalid date (addSuffix: %s)",
    (addSuffix) => {
      expect(() =>
        formatRelativeDate("not-a-date", { now, addSuffix })
      ).toThrow(RangeError);
    }
  );
});
