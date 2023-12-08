import { Buffer } from "node:buffer";
import sharp from "sharp";

export function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}
