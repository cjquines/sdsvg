import { SVG, Svg, registerWindow } from "@svgdotjs/svg.js";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { Buffer } from "node:buffer";
import sharp from "sharp";
import { createSVGWindow } from "svgdom";
import { expect, test } from "vitest";

import { Render } from "./render";

expect.extend({ toMatchImageSnapshot });

const defaultDancer = { x: 0, y: 0, direction: [], label: "", dashed: false };

const drawDancers = (dancers: any[]) => {
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);

  const renderer = new Render({}, SVG(document.documentElement) as Svg);
  dancers.forEach((dancer) =>
    renderer.drawDancer({ ...defaultDancer, ...dancer })
  );
  renderer.resizeImage();
  const svg = renderer.draw.svg();

  return sharp(Buffer.from(svg)).png().toBuffer();
};

test("render", async () => {
  expect(
    await drawDancers([{ x: 0, y: 0, direction: "east" }])
  ).toMatchImageSnapshot();

  expect(
    await drawDancers([
      { x: 0, y: 0, direction: ["north", "south"], shape: "circle" },
      { x: 1, y: 0, direction: [], label: "+", shape: "none" },
      { x: 2, y: 0, direction: "west", color: "red" },
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
