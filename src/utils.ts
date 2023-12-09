import { SVG, Svg, registerWindow } from "@svgdotjs/svg.js";

export type Enumify<T extends object> = T[keyof T];

export async function makeSvg(): Promise<Svg> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    const { createSVGWindow } = await import("svgdom");
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);
    return SVG(document.documentElement) as Svg;
  }
  return SVG();
}
