import { toMatchImageSnapshot } from "jest-image-snapshot";
import { expect, test } from "vitest";

import { makeOptions } from "./options.js";
import { PartialDancer } from "./parser.js";
import { Renderer } from "./renderer.js";
import { svgToPng } from "./testutils.js";
import { makeSvg } from "./utils.js";

expect.extend({ toMatchImageSnapshot });

const defaultDancer = {
  x: 0,
  y: 0,
  direction: [],
  label: "",
  dashed: false,
  rotate: 0,
};

function drawDancers(dancers: PartialDancer[]) {
  const renderer = new Renderer(
    makeOptions({
      body: { size: 100 },
    }),
    makeSvg()
  );
  dancers.forEach((dancer) =>
    renderer.drawDancer({ ...defaultDancer, ...dancer })
  );
  renderer.resizeImage();
  return svgToPng(renderer.draw.svg());
}

test("render", async () => {
  expect(
    await drawDancers([{ x: 0, y: 0, direction: "east" }])
  ).toMatchImageSnapshot();

  expect(
    await drawDancers([
      { x: 0, y: 0, direction: ["north", "south"], shape: "circle" },
      { x: 1, y: 0, direction: [], label: "+", shape: "none" },
      { x: 2, y: 0, direction: "west", color: "red", label: "F", rotate: 120 },
    ])
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
    ])
  ).toMatchImageSnapshot();
});
