import { SVG } from "@svgdotjs/svg.js";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { expect, test } from "vitest";

import { Dancer, resolveDancer } from "./dancer.js";
import { Options, resolveOptions } from "./options.js";
import { Renderer } from "./renderer.js";
import { makeSvg, svgToPng } from "./testutils.js";

expect.extend({ toMatchImageSnapshot });

async function drawDancers(dancers: Dancer[], options: Options = {}) {
  const renderer = new Renderer(
    resolveOptions({
      body: { size: 100 },
      ...options,
    }),
    SVG(makeSvg()),
  );
  dancers.forEach((dancer) => renderer.drawDancer(resolveDancer(dancer)));
  renderer.resizeImage();
  return svgToPng(renderer.draw.svg());
}

test("render", async () => {
  expect(
    await drawDancers([{ x: 0, y: 0, direction: "east" }]),
  ).toMatchImageSnapshot();

  expect(
    await drawDancers([
      { x: 0, y: 0, direction: ["north", "south"], shape: "circle" },
      { x: 1, y: 0, direction: [], label: "+", shape: "none" },
      { x: 2, y: 0, direction: "west", color: "red", label: "F", rotate: 120 },
    ]),
  ).toMatchImageSnapshot();

  expect(
    await drawDancers([
      { x: 0, y: 0, direction: "south", label: "1" },
      { x: 1, y: 0, direction: "south", label: "2" },
      { x: 2, y: 0, direction: "south", label: "3" },
      { x: 3, y: 0, direction: "south", label: "4" },
      { x: 0, y: 1, direction: "north", label: "8" },
      { x: 1, y: 1, direction: "north", label: "7" },
      { x: 2, y: 1, direction: "north", label: "6" },
      { x: 3, y: 1, direction: "north", label: "5" },
    ]),
  ).toMatchImageSnapshot();

  expect(
    await drawDancers(
      [
        { x: 0, y: 0, direction: "south", label: "1" },
        { x: 1, y: 0, direction: "south", label: "2" },
        { x: 2, y: 0, direction: "south", label: "3" },
        { x: 3, y: 0, direction: "south", label: "4" },
        { x: 0, y: 1, direction: "north", label: "8" },
        { x: 1, y: 1, direction: "north", label: "7" },
        { x: 2, y: 1, direction: "north", label: "6" },
        { x: 3, y: 1, direction: "north", label: "5" },
      ],
      { layout: { horizontalGap: `*2` } },
    ),
  ).toMatchImageSnapshot();
});
