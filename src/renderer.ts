import { DancerResolved, Direction, Shape } from "./dancer.js";
import { OptionsResolved, defaultOptions } from "./options.js";
import * as SVG from "./svg.js";

class DancerRenderer {
  private cx: number;
  private cy: number;
  private maskId: string | undefined;
  private maskEl: SVG.Element | undefined;

  constructor(
    public dancer: DancerResolved,
    public options: OptionsResolved,
    private doc: SVG.Document,
  ) {
    const { x, y } = dancer;
    const { body, layout } = options;
    this.cx = x * (body.size + layout.horizontalGap);
    this.cy = y * (body.size + layout.verticalGap);
  }

  private getMask() {
    if (!this.maskEl) {
      const mask = this.doc.createMask();
      this.maskId = mask.id;
      this.maskEl = mask.element;
    }
    return {
      id: this.maskId!,
      element: this.maskEl!,
    };
  }

  private body(): { element: SVG.Element | undefined; shape: Shape } {
    const { color, phantom } = this.dancer;
    const { body } = this.options;
    const shape = this.dancer.shape ?? body.shape;
    const element = SVG.Shape(shape, this.cx, this.cy, body.size)
      ?.fill(color ?? body.fillColor, body.fillOpacity)
      ?.stroke(
        color ?? body.strokeColor,
        body.strokeWidth,
        phantom ? body.phantomDashArray.join(",") : undefined,
      );
    return { element, shape };
  }

  private nose(
    direction: Direction,
    hasBody: boolean,
  ): SVG.Element | undefined {
    const {
      body: { size: bodySize },
      nose: {
        shape,
        size,
        distance,
        fillColor,
        fillOpacity,
        strokeColor,
        strokeWidth,
      },
    } = this.options;
    const { color } = this.dancer;

    if (shape === Shape.None) return undefined;

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

    const cx = this.cx + mulX * (bodySize / 2 + distance);
    const cy = this.cy + mulY * (bodySize / 2 + distance);

    const nose = SVG.Shape(shape, cx, cy, size)
      ?.fill(color ?? fillColor, fillOpacity)
      ?.stroke(color ?? strokeColor, strokeWidth);
    if (!nose) return undefined;

    if (hasBody) {
      const mask = this.getMask();
      mask.element.add(SVG.Shape(shape, cx, cy, size)?.fill("#fff"));
      nose.attr("mask", `url(#${mask.id})`);
    }

    return nose;
  }

  private label(): SVG.Element {
    const { color, label: labelText } = this.dancer;
    const { label } = this.options;
    return SVG.Text(labelText, {
      x: this.cx,
      y: this.cy,
      dy: "0.35em",
      "text-anchor": "middle",
      "font-family": label.family,
      "font-size": label.size,
    }).fill(color ?? label.color, label.opacity);
  }

  draw(): SVG.Element {
    const { direction, rotate } = this.dancer;
    const body = this.body();

    const group = SVG.Group();
    group.add(body.element);

    for (const dir of direction) {
      group.add(this.nose(dir, body.element !== undefined));
    }

    // add black body on top to carve out the body area
    if (this.maskEl && body.element !== undefined) {
      this.maskEl.add(
        SVG.Shape(body.shape, this.cx, this.cy, this.options.body.size)?.fill(
          "#000",
        ),
      );
    }

    if (rotate) {
      group.attr("transform", `rotate(${rotate} ${this.cx} ${this.cy})`);
    }

    return SVG.Group().add(group).add(this.label());
  }
}

export class Renderer {
  options: OptionsResolved;
  private doc: SVG.Document;

  constructor(options?: OptionsResolved) {
    this.options = options ?? defaultOptions;
    this.doc = new SVG.Document(this.options.render.idPrefix);
  }

  drawDancer(dancer: DancerResolved) {
    const renderer = new DancerRenderer(dancer, this.options, this.doc);
    this.doc.add(renderer.draw());
  }

  resizeImage() {
    this.doc.setViewBox(this.options.layout.padding);
  }

  get viewBox(): string | undefined {
    return this.doc.viewBoxAttr;
  }

  innerContent(): string {
    return this.doc.innerContent();
  }

  svg(): string {
    return this.doc.serialize();
  }
}
