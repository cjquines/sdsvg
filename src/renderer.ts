import { DancerResolved, Direction, Shape } from "./dancer.js";
import { OptionsResolved, defaultOptions } from "./options.js";
import * as S from "./svg.js";

function shapeElement(
  shape: Shape,
  cx: number,
  cy: number,
  size: number,
): S.SvgElement | undefined {
  if (shape === Shape.None) return undefined;
  if (shape === Shape.Square) {
    return S.rect({
      x: cx - size / 2,
      y: cy - size / 2,
      width: size,
      height: size,
    });
  }
  return S.circle({ cx, cy, r: size / 2 });
}

function applyFill(
  el: S.SvgElement,
  color: string,
  opacity: number,
): S.SvgElement {
  el.attr("fill", color);
  if (opacity !== 1) el.attr("fill-opacity", opacity);
  return el;
}

function applyStroke(
  el: S.SvgElement,
  color: string,
  width: number,
  dasharray?: string,
): S.SvgElement {
  el.attr("stroke", color);
  el.attr("stroke-width", width);
  if (dasharray) el.attr("stroke-dasharray", dasharray);
  return el;
}

class DancerRenderer {
  private cx: number;
  private cy: number;
  private maskId: string | undefined;
  private maskEl: S.SvgElement | undefined;

  constructor(
    public dancer: DancerResolved,
    public options: OptionsResolved,
    private doc: S.SvgDocument,
  ) {
    const { x, y } = dancer;
    const { body, layout } = options;
    this.cx = x * (body.size + layout.horizontalGap);
    this.cy = y * (body.size + layout.verticalGap);
  }

  private ensureMask() {
    if (this.maskEl) return;
    const mask = this.doc.createMask();
    this.maskId = mask.id;
    this.maskEl = mask.element;
  }

  private drawBody(): { element: S.SvgElement | undefined; shape: Shape } {
    const { color, phantom } = this.dancer;
    const { body } = this.options;
    const shape = this.dancer.shape ?? body.shape;
    const el = shapeElement(shape, this.cx, this.cy, body.size);
    if (el) {
      applyFill(el, color ?? body.fillColor, body.fillOpacity);
      applyStroke(
        el,
        color ?? body.strokeColor,
        body.strokeWidth,
        phantom ? body.phantomDashArray.join(",") : undefined,
      );
    }
    return { element: el, shape };
  }

  private drawNose(
    direction: Direction,
    hasBody: boolean,
  ): S.SvgElement | undefined {
    const {
      body: { size: bodySize },
      nose: { shape, size, distance, fillColor, fillOpacity, strokeColor, strokeWidth },
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

    const noseCx = this.cx + mulX * (bodySize / 2 + distance);
    const noseCy = this.cy + mulY * (bodySize / 2 + distance);

    const noseEl = shapeElement(shape, noseCx, noseCy, size);
    if (!noseEl) return undefined;

    applyFill(noseEl, color ?? fillColor, fillOpacity);
    applyStroke(noseEl, color ?? strokeColor, strokeWidth);

    if (hasBody) {
      this.ensureMask();
      const whiteCopy = shapeElement(shape, noseCx, noseCy, size);
      if (whiteCopy) {
        applyFill(whiteCopy, "#fff", 1);
        this.maskEl!.add(whiteCopy);
      }
      noseEl.attr("mask", `url(#${this.maskId})`);
    }

    return noseEl;
  }

  private drawLabel(): S.SvgElement {
    const { color, label: labelText } = this.dancer;
    const { label } = this.options;
    const el = S.text(labelText, {
      x: this.cx,
      y: this.cy,
      dy: "0.35em",
      "text-anchor": "middle",
      "font-family": label.family,
      "font-size": label.size,
    });
    applyFill(el, color ?? label.color, label.opacity);
    return el;
  }

  drawDancer(): S.SvgElement {
    const { direction, rotate } = this.dancer;
    const { element: bodyEl, shape: bodyShape } = this.drawBody();

    const group = S.g();
    if (bodyEl) group.add(bodyEl);

    direction.forEach((dir) => {
      const noseEl = this.drawNose(dir, bodyEl !== undefined);
      if (noseEl) group.add(noseEl);
    });

    // Finalize mask: add black body on top to carve out the body area
    if (this.maskEl && bodyEl) {
      const maskBody = shapeElement(bodyShape, this.cx, this.cy, this.options.body.size);
      if (maskBody) {
        applyFill(maskBody, "#000", 1);
        this.maskEl.add(maskBody);
      }
    }

    if (rotate) {
      group.attr("transform", `rotate(${rotate} ${this.cx} ${this.cy})`);
    }

    const wrapper = S.g();
    wrapper.add(group);
    wrapper.add(this.drawLabel());
    return wrapper;
  }
}

export class Renderer {
  options: OptionsResolved;
  private doc: S.SvgDocument;

  constructor(options?: OptionsResolved) {
    this.options = options ?? defaultOptions;
    this.doc = new S.SvgDocument();
  }

  drawDancer(dancer: DancerResolved) {
    const renderer = new DancerRenderer(dancer, this.options, this.doc);
    this.doc.add(renderer.drawDancer());
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
