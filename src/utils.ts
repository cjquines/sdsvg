import { SVG, Svg, registerWindow } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";

export function makeSvg(): Svg {
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);
  return SVG(document.documentElement) as Svg;
}