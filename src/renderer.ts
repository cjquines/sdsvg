import * as SVG from "@svgdotjs/svg.js";

import { DancerResolved, Direction, Shape } from "./dancer.js";
import { OptionsResolved, defaultOptions } from "./options.js";

class DancerRenderer {
  constructor(
    public dancer: DancerResolved,
    public options: OptionsResolved,
    public draw: SVG.Svg,
  ) {}

  createShape(shape: Shape): SVG.Shape | undefined {
    if (shape === Shape.None) {
      return undefined;
    }
    return (
      shape === Shape.Square ? this.draw.rect() : this.draw.circle()
    ).remove();
  }

  #center: { x: number; y: number } | undefined;
  get center(): { x: number; y: number } {
    if (this.#center) return this.#center;

    const { x, y } = this.dancer;
    const { body, layout } = this.options;

    this.#center = {
      x: x * (body.size + layout.horizontalGap),
      y: y * (body.size + layout.verticalGap),
    };
    return this.#center;
  }

  #body: SVG.Shape | undefined;
  get body(): SVG.Shape | undefined {
    if (this.#body) return this.#body;

    const {
      body: { shape, size },
    } = this.options;
    const { x, y } = this.center;

    this.#body = this.createShape(this.dancer.shape ?? shape)
      ?.size(size, size)
      .center(x, y);
    return this.#body;
  }

  #baseNose: SVG.Shape | undefined;
  get baseNose(): SVG.Shape | undefined {
    if (this.#baseNose) return this.#baseNose;

    const {
      nose: { shape, size },
    } = this.options;

    this.#baseNose = this.createShape(shape)?.size(size, size);
    return this.#baseNose;
  }

  #noseMask: SVG.Mask | undefined;
  get noseMask() {
    if (this.#noseMask) return this.#noseMask;
    if (!this.body) return undefined;

    const mask = this.draw.mask();
    this.#noseMask = mask;
    return mask;
  }

  finalizeNoseMask() {
    this.noseMask?.add(this.body!.fill("#000"));
  }

  nose(direction: Direction) {
    if (!this.baseNose || !this.noseMask) return undefined;

    const {
      body: { size: bodySize },
      nose: { distance },
    } = this.options;

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

    const { x, y } = this.center;
    const nose = this.baseNose
      .clone()
      .center(
        x + mulX * (bodySize / 2 + distance),
        y + mulY * (bodySize / 2 + distance),
      );

    this.noseMask.add(nose.clone().fill("#fff"));
    nose.maskWith(this.noseMask);

    return nose;
  }

  drawDancer() {
    const { color, direction, label: labelText, phantom, rotate } = this.dancer;
    const { body, nose, label } = this.options;
    const { x, y } = this.center;

    const group = this.draw.group();

    // body
    this.body
      ?.clone()
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
    direction.forEach((direction) =>
      this.nose(direction)
        ?.fill({
          color: color ?? nose.fillColor,
          opacity: nose.fillOpacity,
        })
        .stroke({
          color: color ?? nose.strokeColor,
          width: nose.strokeWidth,
        })
        .putIn(group),
    );

    this.finalizeNoseMask();

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
}

export class Renderer {
  options: OptionsResolved;
  draw: SVG.Svg;

  constructor(options?: OptionsResolved, draw?: SVG.Svg) {
    this.options = options ?? defaultOptions;
    this.draw = draw ?? SVG.SVG();
  }

  drawDancer(dancer: DancerResolved) {
    const renderer = new DancerRenderer(dancer, this.options, this.draw);
    renderer.drawDancer();
  }

  resizeImage() {
    const {
      layout: { padding: p },
    } = this.options;

    const { x, y, w, h } = this.draw.bbox();
    this.draw.viewbox(x - p, y - p, w + 2 * p, h + 2 * p);
  }
}
