import SVG from "@svgdotjs/svg.js";

import { Dancer, Direction, Options, Point, Shape } from ".";

export class Render {
  options: Options;
  draw: SVG.Svg;

  constructor(options: Options, draw?: SVG.Svg) {
    this.options = options;
    this.draw = draw ?? SVG.SVG();
  }

  getCenter(dancer: Dancer): Point {
    const { x, y } = dancer;
    const { dancerSize, horizontalSpace, verticalSpace } = this.options;
    return {
      x: x * (dancerSize + horizontalSpace),
      y: y * (dancerSize + verticalSpace),
    };
  }

  getBody(dancer: Dancer): SVG.Shape | undefined {
    const { shape } = dancer;
    const { dancerSize } = this.options;
    if (shape === Shape.None) {
      return undefined;
    }
    const body = shape === Shape.Square ? this.draw.rect() : this.draw.circle();
    const { x, y } = this.getCenter(dancer);
    body.size(dancerSize, dancerSize).center(x, y);
    return body;
  }

  getNose(dancer: Dancer, direction: Direction): SVG.Shape | undefined {
    const { dancerSize, noseSize } = this.options;
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
    const distance = dancerSize / 2 + noseSize / 4;
    const noseX = x + mulX * distance;
    const noseY = y + mulY * distance;
    const nose = this.draw.circle();
    nose.size(noseSize).center(noseX, noseY);

    const mask = this.draw.mask();
    mask.add(nose.clone().fill("#fff")).add(body.fill("#000"));
    nose.maskWith(mask);

    return nose;
  }

  drawDancer(dancer: Dancer) {
    const { direction, label } = dancer;
    const { dancerSize, strokeWidth } = this.options;
    const { x, y } = this.getCenter(dancer);

    // TODO: color
    // TODO: dashed

    // body
    this.getBody(dancer)
      ?.fill({ color: "#0000" })
      .stroke({ color: "#000", width: strokeWidth });

    // noses
    const directions = Array.isArray(direction) ? direction : [direction];
    directions.forEach((direction) =>
      this.getNose(dancer, direction)?.fill({ color: "#000" })
    );

    // label
    this.draw
      .text(label)
      .fill({ color: "#000" })
      .font("family", "Open Sans")
      .font("size", dancerSize * 0.8)
      .center(x, y);
  }

  resizeImage(padding: number) {
    const box = this.draw.bbox();
    this.draw.viewbox(
      box.x - padding,
      box.y - padding,
      box.w + 2 * padding,
      box.h + 2 * padding
    );
  }
}
