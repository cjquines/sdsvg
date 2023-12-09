import { SVG, Svg, registerWindow } from "@svgdotjs/svg.js";
import { Buffer } from "node:buffer";
import sharp from "sharp";
import { createSVGWindow } from "svgdom";

export function makeSvg(): SVGSVGElement {
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);
  return document.documentElement;
}

export function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}
