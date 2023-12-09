import { toMatchImageSnapshot } from "jest-image-snapshot";
import { expect, test } from "vitest";

import { formationToSvg } from "./formation";
import { svgToPng } from "./testutils";

expect.extend({ toMatchImageSnapshot });

function toPng(...args: Parameters<typeof formationToSvg>) {
  return svgToPng(formationToSvg(...args));
}

test("render", async () => {
  expect(await toPng("1> 2> . . / . . 6< 5<")).toMatchImageSnapshot({
    customSnapshotIdentifier: "sample1",
  });

  expect(
    await toPng("e.e/nsns/w.w", {
      body: { opacity: 0.2 },
      nose: { size: 2 },
    })
  ).toMatchImageSnapshot({ customSnapshotIdentifier: "sample2" });

  expect(
    await toPng(
      [
        { x: 0, y: 0, direction: "north", label: "A", color: "blue" },
        { x: 1, y: 0, direction: ["north", "south"], label: "B", dashed: true },
      ],
      { layout: { geometry: "hexagon", origin: { x: 0.5, y: -1.5 } } }
    )
  ).toMatchImageSnapshot({ customSnapshotIdentifier: "sample3" });
});
