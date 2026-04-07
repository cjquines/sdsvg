import { toMatchImageSnapshot } from "jest-image-snapshot";
import { expect, test } from "vitest";

import { Formation, formationToSvg } from "./formation.js";
import { svgToPng } from "./testutils.js";

expect.extend({ toMatchImageSnapshot });

function toPng(...args: Parameters<typeof formationToSvg>) {
  return svgToPng(new Formation(...args).toString());
}

test("toElement", () => {
  const formation = new Formation("1> 2>");
  const svg = formation.toString();

  // Simulate a bare SVGSVGElement with setAttribute and innerHTML
  const el = { attrs: {} as Record<string, string>, innerHTML: "" } as unknown as SVGSVGElement;
  Object.defineProperty(el, "setAttribute", {
    value(name: string, value: string) {
      (el as any).attrs[name] = value;
    },
  });

  formation.toElement(el);

  // Should set the viewBox and inject inner content
  expect((el as any).attrs.viewBox).toBeDefined();
  expect(el.innerHTML).toBeTruthy();

  // innerHTML should match what toString produces (minus the outer <svg> wrapper)
  expect(svg).toContain(el.innerHTML);
  expect(svg).toContain((el as any).attrs.viewBox);
});

test("render", async () => {
  expect(await toPng("1> 2> . . / . . 6< 5<")).toMatchImageSnapshot({
    customSnapshotIdentifier: "sample1",
  });

  expect(
    await toPng("e.e/nsns/w.w", {
      body: { fillOpacity: 0.2 },
      nose: { size: `*2` },
    }),
  ).toMatchImageSnapshot({ customSnapshotIdentifier: "sample2" });

  expect(
    await toPng(
      [
        { x: 0, y: 0, direction: "north", label: "A", color: "blue" },
        {
          x: 1,
          y: 0,
          direction: ["north", "south"],
          label: "B",
          phantom: true,
        },
      ],
      { layout: { geometry: "hexagon", origin: { x: 0.5, y: -1.5 } } },
    ),
  ).toMatchImageSnapshot({ customSnapshotIdentifier: "sample3" });
});
