type Attrs = Record<string, string | number>;

function escapeAttr(s: string): string {
  // ' and > can't break parsing, and user-input is assumed-trusted
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function parseRotation(
  transform: string | number | undefined,
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

export class Element {
  tag: string;
  attrs: Attrs;
  children: (Element | string)[];

  constructor(
    tag: string,
    attrs: Attrs = {},
    children: (Element | string)[] = [],
  ) {
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
  }

  attr(key: string, value?: string | number | undefined): this {
    if (value !== undefined) {
      this.attrs[key] = value;
    } else {
      delete this.attrs[key];
    }
    return this;
  }

  fill(color: string, opacity?: number): this {
    this.attr("fill", color);
    if (opacity !== undefined && opacity !== 1) {
      this.attr("fill-opacity", opacity);
    }
    return this;
  }

  stroke(color: string, width: number, dasharray?: string): this {
    this.attr("stroke", color);
    this.attr("stroke-width", width);
    if (dasharray) this.attr("stroke-dasharray", dasharray);
    return this;
  }

  add(child?: Element | string | undefined): this {
    if (child !== undefined) {
      this.children.push(child);
    }
    return this;
  }

  toString(): string {
    const attrs = Object.entries(this.attrs)
      .map(([k, v]) => ` ${k}="${escapeAttr(String(v))}"`)
      .join("");

    if (this.children.length === 0) {
      return `<${this.tag}${attrs}/>`;
    }

    const inner = this.children
      .map((c) => (typeof c === "string" ? escapeText(c) : c.toString()))
      .join("");

    return `<${this.tag}${attrs}>${inner}</${this.tag}>`;
  }

  private leafBounds(): Box | undefined {
    if (this.tag === "rect") {
      const x = Number(this.attrs.x ?? 0);
      const y = Number(this.attrs.y ?? 0);
      const w = Number(this.attrs.width ?? 0);
      const h = Number(this.attrs.height ?? 0);
      const sw = Number(this.attrs["stroke-width"] ?? 0) / 2;
      return new Box(x - sw, y - sw, x + w + sw, y + h + sw);
    }
    if (this.tag === "circle") {
      const cx = Number(this.attrs.cx ?? 0);
      const cy = Number(this.attrs.cy ?? 0);
      const r = Number(this.attrs.r ?? 0);
      const sw = Number(this.attrs["stroke-width"] ?? 0) / 2;
      return new Box(cx - r - sw, cy - r - sw, cx + r + sw, cy + r + sw);
    }
    if (this.tag === "text") {
      const x = Number(this.attrs.x ?? 0);
      const y = Number(this.attrs.y ?? 0);
      const fontSize = Number(this.attrs["font-size"] ?? 16);
      const dy = typeof this.attrs.dy === "string" && this.attrs.dy.endsWith("em")
        ? parseFloat(this.attrs.dy) * fontSize
        : Number(this.attrs.dy ?? 0);
      const content =
        this.children.find((c): c is string => typeof c === "string") ?? "";
      if (content) {
        const halfW = (fontSize * 0.6 * content.length) / 2;
        const halfH = fontSize / 2;
        const cy = y + dy;
        return new Box(x - halfW, cy - halfH, x + halfW, cy + halfH);
      }
    }
    return undefined;
  }

  private rotatedBounds(
    angle: number,
    cx: number,
    cy: number,
  ): Box | undefined {
    // Circles are rotation-invariant: just rotate the center point.
    if (this.tag === "circle") {
      const r = Number(this.attrs.r ?? 0);
      const sw = Number(this.attrs["stroke-width"] ?? 0) / 2;
      const ccx = Number(this.attrs.cx ?? 0);
      const ccy = Number(this.attrs.cy ?? 0);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = ccx - cx;
      const dy = ccy - cy;
      const newCx = cx + dx * cos - dy * sin;
      const newCy = cy + dx * sin + dy * cos;
      const extent = r + sw;
      return new Box(newCx - extent, newCy - extent, newCx + extent, newCy + extent);
    }
    return this.bounds()?.rotate(angle, cx, cy);
  }

  bounds(): Box | undefined {
    if (this.tag === "defs" || this.tag === "mask") return undefined;

    let box = this.leafBounds();

    const rotation =
      this.tag === "g" ? parseRotation(this.attrs.transform) : undefined;

    for (const child of this.children) {
      if (typeof child === "string") continue;
      const childBox = rotation
        ? child.rotatedBounds(rotation.angle, rotation.cx, rotation.cy)
        : child.bounds();
      if (!childBox) continue;
      box = box ? box.merge(childBox) : childBox;
    }

    return box;
  }
}

export function Group() {
  return new Element("g");
}

export function Text(content: string, attrs: Attrs = {}) {
  return new Element("text", attrs, [content]);
}

export function Shape(
  shape: "square" | "circle" | "none",
  cx: number,
  cy: number,
  size: number,
): Element | undefined {
  switch (shape) {
    case "square": {
      return new Element("rect", {
        x: cx - size / 2,
        y: cy - size / 2,
        width: size,
        height: size,
      });
    }
    case "circle": {
      return new Element("circle", { cx, cy, r: size / 2 });
    }
  }
  shape satisfies "none";
  return undefined;
}

class Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;

  constructor(minX: number, minY: number, maxX: number, maxY: number) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  merge(other?: Box | undefined): Box {
    if (!other) return this;
    return new Box(
      Math.min(this.minX, other.minX),
      Math.min(this.minY, other.minY),
      Math.max(this.maxX, other.maxX),
      Math.max(this.maxY, other.maxY),
    );
  }

  rotate(angle: number, cx: number, cy: number): Box {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const corners = [
      { x: this.minX, y: this.minY },
      { x: this.maxX, y: this.minY },
      { x: this.maxX, y: this.maxY },
      { x: this.minX, y: this.maxY },
    ];

    const rotated = corners.map(({ x, y }) => {
      const dx = x - cx;
      const dy = y - cy;
      return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos,
      };
    });

    return new Box(
      Math.min(...rotated.map(({ x }) => x)),
      Math.min(...rotated.map(({ y }) => y)),
      Math.max(...rotated.map(({ x }) => x)),
      Math.max(...rotated.map(({ y }) => y)),
    );
  }
}

export class Document {
  private root: Element;
  private defsEl: Element;
  private maskCounter = 0;
  private idPrefix: string;

  constructor(idPrefix = "") {
    this.root = new Element("svg", { xmlns: "http://www.w3.org/2000/svg" });
    this.defsEl = new Element("defs");
    this.root.add(this.defsEl);
    this.idPrefix = idPrefix;
  }

  add(child: Element): void {
    this.root.add(child);
  }

  createMask(): { id: string; element: Element } {
    const id = `${this.idPrefix}m${++this.maskCounter}`;
    const el = new Element("mask", { id });
    this.defsEl.add(el);
    return { id, element: el };
  }

  computeBounds(): Box | undefined {
    return this.root.bounds();
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
      .map((c) => (typeof c === "string" ? escapeText(c) : c.toString()))
      .join("");
  }

  serialize(): string {
    return this.root.toString();
  }
}
