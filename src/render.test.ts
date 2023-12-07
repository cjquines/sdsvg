import { SVG, Svg, registerWindow } from "@svgdotjs/svg.js";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { Buffer } from "node:buffer";
import sharp from "sharp";
import { createSVGWindow } from "svgdom";
import { expect, test } from "vitest";

import { Dancer, Direction, Geometry, Shape } from ".";
import { Render } from "./render";

expect.extend({ toMatchImageSnapshot });

const svgToPng = (svg: string) => sharp(Buffer.from(svg)).png().toBuffer();

test("render", async () => {
  const options = {
    dancerSize: 30,
    noseSize: 12,
    horizontalSpace: 42,
    verticalSpace: 42,
    strokeWidth: 2.5,
    phantomDashArray: [2, 2],
    geometry: Geometry.None,
    origin: { x: 0, y: 0 },
  };

  const defaultDancer = {
    x: 0,
    y: 0,
    direction: [],
    label: "",
    color: "",
    dashed: false,
    shape: Shape.Square,
  };

  const getDancers = (dancers: Partial<Dancer>[]) => {
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);
    const renderer = new Render(options, SVG(document.documentElement) as Svg);
    dancers.forEach((dancer) =>
      renderer.drawDancer({ ...defaultDancer, ...dancer })
    );
    renderer.resizeImage(10);
    return svgToPng(renderer.draw.svg());
  };

  expect(
    await getDancers([{ x: 0, y: 0, direction: Direction.East }])
  ).toMatchImageSnapshot();

  expect(
    await getDancers([
      { x: 0, y: 0, direction: Direction.South, label: "1" },
      { x: 1, y: 0, direction: Direction.South, label: "2" },
      { x: 2, y: 0, direction: Direction.South, label: "3" },
      { x: 3, y: 0, direction: Direction.South, label: "4" },
      { x: 0, y: 1, direction: Direction.North, label: "8" },
      { x: 1, y: 1, direction: Direction.North, label: "7" },
      { x: 2, y: 1, direction: Direction.North, label: "6" },
      { x: 3, y: 1, direction: Direction.North, label: "5" },
    ])
  ).toMatchImageSnapshot();
});
