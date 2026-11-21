import { describe, expect, it } from "vitest";
import { EASE, glowFromSwatch, hexToHslTriplet } from "./motion";

const STEEL = "215 30% 62%";

describe("hexToHslTriplet", () => {
  it("converts the documented example", () => {
    expect(hexToHslTriplet("#FF5A1F")).toBe("16 100% 56%");
  });

  it("converts the primary hues", () => {
    expect(hexToHslTriplet("#FF0000")).toBe("0 100% 50%");
    expect(hexToHslTriplet("#00FF00")).toBe("120 100% 50%");
    expect(hexToHslTriplet("#0000FF")).toBe("240 100% 50%");
  });

  it("accepts 3-digit shorthand, lowercase and a missing #", () => {
    expect(hexToHslTriplet("#F00")).toBe(hexToHslTriplet("#FF0000"));
    expect(hexToHslTriplet("#ff5a1f")).toBe(hexToHslTriplet("#FF5A1F"));
    expect(hexToHslTriplet("FF5A1F")).toBe(hexToHslTriplet("#FF5A1F"));
  });

  it("wraps magenta-ish reds into the 300-360 degree range rather than going negative", () => {
    const hue = Number(hexToHslTriplet("#FF0080").split(" ")[0]);
    expect(hue).toBeGreaterThanOrEqual(300);
    expect(hue).toBeLessThan(360);
  });

  it.each([
    ["black", "#000000"],
    ["near-black", "#111111"],
    ["white", "#FFFFFF"],
    ["near-white", "#F4F4F4"],
    ["mid grey", "#808080"],
    ["cloud grey", "#D9DCDF"],
    ["a barely tinted grey", "#B0A0A0"],
  ])("falls back to the steel glow for neutral %s", (_name, hex) => {
    expect(hexToHslTriplet(hex)).toBe(STEEL);
  });

  it("falls back to steel for unparseable input instead of throwing", () => {
    expect(hexToHslTriplet("")).toBe(STEEL);
    expect(hexToHslTriplet("not-a-colour")).toBe(STEEL);
  });

  it("lifts a dark saturated colour to at least 45% lightness", () => {
    expect(hexToHslTriplet("#330000")).toBe("0 100% 45%");
  });

  it("pulls a pale saturated colour down to at most 62% lightness", () => {
    expect(hexToHslTriplet("#FFCCCC")).toBe("0 100% 62%");
  });

  it("raises weak-but-not-neutral saturation to a 55% floor", () => {
    expect(hexToHslTriplet("#C09090")).toBe("0 55% 62%");
  });

  it("always returns 'H S% L%' with in-range numbers for chromatic input", () => {
    for (const hex of ["#B3121F", "#D7F23A", "#2B4DB8", "#9FE2C8", "#FF5A1F"]) {
      const m = hexToHslTriplet(hex).match(/^(\d+) (\d+)% (\d+)%$/);
      expect(m, hex).not.toBeNull();
      const [h, s, l] = m!.slice(1).map(Number);
      expect(h).toBeLessThanOrEqual(360);
      expect(s).toBeGreaterThanOrEqual(55);
      expect(s).toBeLessThanOrEqual(100);
      expect(l).toBeGreaterThanOrEqual(45);
      expect(l).toBeLessThanOrEqual(62);
    }
  });
});

describe("glowFromSwatch", () => {
  it("uses the more saturated swatch even when it is the sole", () => {
    expect(glowFromSwatch(["#111111", "#FF5A1F"])).toBe(hexToHslTriplet("#FF5A1F"));
  });

  it("uses the upper when it is the more saturated swatch", () => {
    expect(glowFromSwatch(["#FF5A1F", "#111111"])).toBe(hexToHslTriplet("#FF5A1F"));
  });

  it("prefers the upper when both are equally saturated", () => {
    expect(glowFromSwatch(["#FF0000", "#0000FF"])).toBe(hexToHslTriplet("#FF0000"));
  });

  it("falls back to steel when both swatches are neutral", () => {
    expect(glowFromSwatch(["#F4F4F4", "#FFFFFF"])).toBe(STEEL);
    expect(glowFromSwatch(["#D9DCDF", "#FFFFFF"])).toBe(STEEL);
    expect(glowFromSwatch(["#111111", "#111111"])).toBe(STEEL);
  });
});

describe("EASE", () => {
  it("is a valid cubic-bezier control quadruple", () => {
    expect(EASE).toHaveLength(4);
    expect(EASE[0]).toBeGreaterThanOrEqual(0);
    expect(EASE[2]).toBeLessThanOrEqual(1);
  });
});
