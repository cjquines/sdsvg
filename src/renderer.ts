import * as SVG from "@svgdotjs/svg.js";

import { DancerResolved, Direction, Shape } from "./dancer.js";
import { OptionsResolved, defaultOptions } from "./options.js";

export class Renderer {
  options: OptionsResolved;
  draw: SVG.Svg;

  constructor(options?: OptionsResolved, draw?: SVG.Svg) {
    this.options = options ?? defaultOptions;
    this.draw = draw ?? SVG.SVG();
  }

  getCenter(dancer: DancerResolved): { x: number; y: number } {
    const { x, y } = dancer;
    const { body, layout } = this.options;

    return {
      x: x * (body.size + layout.horizontalGap),
      y: y * (body.size + layout.verticalGap),
    };
  }

  createShape(shape: Shape): SVG.Shape | undefined {
    if (shape === Shape.None) {
      return undefined;
    }
    return (
      shape === Shape.Square ? this.draw.rect() : this.draw.circle()
    ).remove();
  }

  getBody(dancer: DancerResolved): SVG.Shape | undefined {
    const {
      body: { shape, size },
    } = this.options;
    const { x, y } = this.getCenter(dancer);
    return this.createShape(dancer.shape ?? shape)
      ?.size(size, size)
      .center(x, y);
  }

  getNose(dancer: DancerResolved, direction: Direction): SVG.Shape | undefined {
    const {
      body: { size: bodySize },
      nose: { distance, shape, size },
    } = this.options;
    const body = this.getBody(dancer);
    if (!body) return undefined;

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
    const nose = this.createShape(shape)
      ?.size(size, size)
      .center(
        x + mulX * (bodySize / 2 + distance),
        y + mulY * (bodySize / 2 + distance)
      );
    if (!nose) return undefined;

    const mask = this.draw.mask();
    mask.add(nose.clone().fill("#fff")).add(body.fill("#000"));
    nose.maskWith(mask);

    return nose;
  }

  drawDancer(dancer: DancerResolved) {
    const { color, direction, label: labelText, phantom, rotate } = dancer;
    const { body, nose, label } = this.options;
    const { x, y } = this.getCenter(dancer);

    const group = this.draw.group();

    // body
    this.getBody(dancer)
      ?.fill({
        color: color ?? body.fillColor,
        opacity: body.fillOpacity,
      })
      .stroke({
        color: color ?? body.strokeColor,
        width: body.strokeWidth,
        dasharray: phantom ? body.phantomDashArray.join(",") : undefined,
      })
      .putIn(group);

    // noses
    (Array.isArray(direction) ? direction : [direction]).forEach((direction) =>
      this.getNose(dancer, direction)
        ?.fill({
          color: color ?? nose.fillColor,
          opacity: nose.fillOpacity,
        })
        .stroke({
          color: color ?? nose.strokeColor,
          width: nose.strokeWidth,
        })
        .putIn(group)
    );

    group.rotate(rotate, x, y);

    // label
    this.draw
      .text(labelText)
      .fill({
        color: color ?? label.color,
        opacity: label.opacity,
      })
      .font("family", label.family)
      .font("size", label.size)
      .center(x, y);

    group.putIn(this.draw);
  }

  resizeImage() {
    const {
      layout: { padding: p },
    } = this.options;

    const { x, y, w, h } = this.draw.bbox();
    this.draw.viewbox(x - p, y - p, w + 2 * p, h + 2 * p);
  }
}
