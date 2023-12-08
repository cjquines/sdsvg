import SVG from "@svgdotjs/svg.js";

import { Dancer, Direction, Point, Shape, toHex } from "./dancer";
import { Options, PartialOptions, extendOptions } from "./options";

export class Render {
  options: Options;
  draw: SVG.Svg;

  constructor(options?: PartialOptions, draw?: SVG.Svg) {
    this.options = extendOptions(options ?? {});
    this.draw = draw ?? SVG.SVG();
  }

  getCenter(dancer: Dancer): Point {
    const { x, y } = dancer;
    const { body, space } = this.options;

    return {
      x: x * (body.size + space.horizontal),
      y: y * (body.size + space.vertical),
    };
  }

  getBody(dancer: Dancer): SVG.Shape | undefined {
    const { shape = this.options.body.shape } = dancer;
    const {
      body: { size },
    } = this.options;
    if (shape === Shape.None) {
      return undefined;
    }

    const body = shape === Shape.Square ? this.draw.rect() : this.draw.circle();
    const { x, y } = this.getCenter(dancer);
    body.size(size, size).center(x, y);

    return body;
  }

  getNose(dancer: Dancer, direction: Direction): SVG.Shape | undefined {
    const {
      nose: { distance, size },
    } = this.options;
    const body = this.getBody(dancer);
    if (!body) {
      return undefined;
    }

    const [mulX, mulY] = (() => {
      switch (direction) {
        case Direction.North:
          return [0, -1];
        case Direction.East:
          return [1, 0];
        case Direction.South:
          return [0, 1];
        case Direction.West:
          return [-1, 0];
      }
    })();

    const { x, y } = this.getCenter(dancer);
    const noseX = x + mulX * distance;
    const noseY = y + mulY * distance;
    const nose = this.draw.circle();
    nose.size(size).center(noseX, noseY);

    const mask = this.draw.mask();
    mask.add(nose.clone().fill("#fff")).add(body.fill("#000"));
    nose.maskWith(mask);

    return nose;
  }

  drawDancer(dancer: Dancer) {
    const { color, dashed, direction, label: labelText } = dancer;
    const { body, nose, label, stroke } = this.options;
    const { x, y } = this.getCenter(dancer);

    // body
    this.getBody(dancer)
      ?.fill({ color: toHex(color ?? body.color, body.opacity) })
      .stroke({
        color: toHex(color ?? body.color, 1),
        width: stroke.width,
        dasharray: dashed ? stroke.phantomDashArray.join(",") : undefined,
      });

    // noses
    (Array.isArray(direction) ? direction : [direction]).forEach((direction) =>
      this.getNose(dancer, direction)
        ?.fill({ color: toHex(color ?? nose.color, nose.opacity) })
        .stroke({ color: toHex(color ?? nose.color, 1), width: stroke.width })
    );

    // label
    this.draw
      .text(labelText)
      .fill({ color: toHex(color ?? label.color, label.opacity) })
      .font("family", label.family)
      .font("size", label.size)
      .center(x, y);
  }

  resizeImage() {
    const {
      space: { padding: p },
    } = this.options;

    const { x, y, w, h } = this.draw.bbox();
    this.draw.viewbox(x - p, y - p, w + 2 * p, h + 2 * p);
  }
}
