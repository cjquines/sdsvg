type Attrs = Record<string, string | number | undefined>;

export class SvgElement {
  tag: string;
  attrs: Attrs;
  children: (SvgElement | string)[];

  constructor(tag: string, attrs: Attrs = {}, children: (SvgElement | string)[] = []) {
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
  }

  attr(key: string, value: string | number | undefined): this {
    if (value !== undefined) this.attrs[key] = value;
    return this;
  }

  add(child: SvgElement | string): this {
    this.children.push(child);
    return this;
  }

  serialize(): string {
    const attrs = Object.entries(this.attrs)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => ` ${k}="${escapeAttr(String(v))}"`)
      .join("");

    if (this.children.length === 0) {
      return `<${this.tag}${attrs}/>`;
    }

    const inner = this.children
      .map((c) => (typeof c === "string" ? escapeText(c) : c.serialize()))
      .join("");

    return `<${this.tag}${attrs}>${inner}</${this.tag}>`;
  }
}

// Only escapes characters that can break SVG attribute/text parsing.
// ' and > are safe to leave unescaped in this context.
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

// Convenience constructors

export function g(attrs: Attrs = {}): SvgElement {
  return new SvgElement("g", attrs);
}

export function rect(attrs: Attrs = {}): SvgElement {
  return new SvgElement("rect", attrs);
}

export function circle(attrs: Attrs = {}): SvgElement {
  return new SvgElement("circle", attrs);
}

export function text(content: string, attrs: Attrs = {}): SvgElement {
  const el = new SvgElement("text", attrs);
  el.add(content);
  return el;
}

// Bounds computation from the element tree.

type Box = { minX: number; minY: number; maxX: number; maxY: number };

function mergeBox(a: Box | undefined, b: Box): Box {
  if (!a) return { ...b };
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

function rotateBox(box: Box, angle: number, cx: number, cy: number): Box {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const corners = [
    { x: box.minX, y: box.minY },
    { x: box.maxX, y: box.minY },
    { x: box.maxX, y: box.maxY },
    { x: box.minX, y: box.maxY },
  ];
  const rotated = corners.map(({ x, y }) => {
    const dx = x - cx;
    const dy = y - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
  });
  return {
    minX: Math.min(rotated[0].x, rotated[1].x, rotated[2].x, rotated[3].x),
    minY: Math.min(rotated[0].y, rotated[1].y, rotated[2].y, rotated[3].y),
    maxX: Math.max(rotated[0].x, rotated[1].x, rotated[2].x, rotated[3].x),
    maxY: Math.max(rotated[0].y, rotated[1].y, rotated[2].y, rotated[3].y),
  };
}

function parseRotation(
  transform: string | undefined,
): { angle: number; cx: number; cy: number } | undefined {
  if (typeof transform !== "string") return undefined;
  const match = transform.match(/rotate\(([^ ]+) ([^ ]+) ([^ ]+)\)/);
  if (!match) return undefined;
  return {
    angle: (Number(match[1]) * Math.PI) / 180,
    cx: Number(match[2]),
    cy: Number(match[3]),
  };
}

// Returns the bounding box of a circle after its center is rotated.
// Unlike rotateBox, this doesn't inflate the bounds.
function rotateCircleBounds(
  cx: number,
  cy: number,
  r: number,
  angle: number,
  pivotX: number,
  pivotY: number,
): Box {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = cx - pivotX;
  const dy = cy - pivotY;
  const newCx = pivotX + dx * cos - dy * sin;
  const newCy = pivotY + dx * sin + dy * cos;
  return { minX: newCx - r, minY: newCy - r, maxX: newCx + r, maxY: newCy + r };
}

function leafBounds(el: SvgElement): Box | undefined {
  if (el.tag === "rect") {
    const x = Number(el.attrs.x ?? 0);
    const y = Number(el.attrs.y ?? 0);
    const w = Number(el.attrs.width ?? 0);
    const h = Number(el.attrs.height ?? 0);
    return { minX: x, minY: y, maxX: x + w, maxY: y + h };
  }
  if (el.tag === "circle") {
    const cx = Number(el.attrs.cx ?? 0);
    const cy = Number(el.attrs.cy ?? 0);
    const r = Number(el.attrs.r ?? 0);
    return { minX: cx - r, minY: cy - r, maxX: cx + r, maxY: cy + r };
  }
  if (el.tag === "text") {
    const x = Number(el.attrs.x ?? 0);
    const y = Number(el.attrs.y ?? 0);
    const fontSize = Number(el.attrs["font-size"] ?? 16);
    const content =
      el.children.find((c): c is string => typeof c === "string") ?? "";
    if (content) {
      // Rough heuristic: assumes ~0.6em per character. Works for short
      // labels (1-2 chars) but will drift for longer text or proportional fonts.
      const halfW = (fontSize * 0.6 * content.length) / 2;
      const halfH = fontSize / 2;
      return { minX: x - halfW, minY: y - halfH, maxX: x + halfW, maxY: y + halfH };
    }
  }
  return undefined;
}

function applyRotationToChild(
  child: SvgElement,
  childBox: Box,
  rotation: { angle: number; cx: number; cy: number },
): Box {
  // Circles are rotation-invariant: just rotate the center point.
  if (child.tag === "circle") {
    const r = Number(child.attrs.r ?? 0);
    const ccx = Number(child.attrs.cx ?? 0);
    const ccy = Number(child.attrs.cy ?? 0);
    return rotateCircleBounds(ccx, ccy, r, rotation.angle, rotation.cx, rotation.cy);
  }
  return rotateBox(childBox, rotation.angle, rotation.cx, rotation.cy);
}

function elementBounds(el: SvgElement): Box | undefined {
  if (el.tag === "defs" || el.tag === "mask") return undefined;

  let box = leafBounds(el);

  const transform = el.attrs.transform;
  const rotation =
    el.tag === "g" && typeof transform === "string"
      ? parseRotation(transform)
      : undefined;

  for (const child of el.children) {
    if (typeof child === "string") continue;
    let childBox = elementBounds(child);
    if (!childBox) continue;
    if (rotation) childBox = applyRotationToChild(child, childBox, rotation);
    box = mergeBox(box, childBox);
  }

  return box;
}

// SvgDocument: owns the root <svg>, <defs>, and serialization.

export class SvgDocument {
  private root: SvgElement;
  private defsEl: SvgElement;
  private maskCounter = 0;

  constructor() {
    this.root = new SvgElement("svg", { xmlns: "http://www.w3.org/2000/svg" });
    this.defsEl = new SvgElement("defs");
    this.root.add(this.defsEl);
  }

  add(child: SvgElement): void {
    this.root.add(child);
  }

  createMask(): { id: string; element: SvgElement } {
    const id = `m${++this.maskCounter}`;
    const el = new SvgElement("mask", { id });
    this.defsEl.add(el);
    return { id, element: el };
  }

  computeBounds(): Box | undefined {
    return elementBounds(this.root);
  }

  setViewBox(padding: number): void {
    const box = this.computeBounds();
    if (!box) return;
    this.root.attr(
      "viewBox",
      `${box.minX - padding} ${box.minY - padding} ${box.maxX - box.minX + 2 * padding} ${box.maxY - box.minY + 2 * padding}`,
    );
  }

  get viewBoxAttr(): string | undefined {
    const v = this.root.attrs.viewBox;
    return typeof v === "string" ? v : undefined;
  }

  innerContent(): string {
    return this.root.children
      .map((c) => (typeof c === "string" ? escapeText(c) : c.serialize()))
      .join("");
  }

  serialize(): string {
    return this.root.serialize();
  }
}
