import { join } from "node:path";

declare const OffscreenCanvas: new (w: number, h: number) => {
  getContext(type: "2d"): any;
};
declare const Path2D: new (d: string) => any;

const CATALOG_ROOT: string = (process.env as any).CATALOG_ROOT;
const ICON_SVG_PATH = join(CATALOG_ROOT, "lib/icons/extension-logos/macros-repeater/icon.svg");

const SIZES = [16, 48, 128];
const BG = "#012292";
const FG = "#ffffff";

const ICON_PATHS = [
  "M14 4.1 12 6",
  "m5.1 8-2.9-.8",
  "m6 12-1.9 2",
  "M7.2 2.2 8 5.1",
  "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
];

function renderIcon(size: number): { size: number; data: Buffer } {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const scale = size / 24;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.scale(scale, scale);
  ctx.strokeStyle = FG;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const d of ICON_PATHS) {
    ctx.stroke(new Path2D(d));
  }

  ctx.restore();

  const imageData = ctx.getImageData(0, 0, size, size);
  return { size, data: Buffer.from(imageData.data.buffer) };
}

export function getInactiveManifestRasters() {
  return SIZES.map(renderIcon);
}

export const manifestIconOutputs = [
  {
    prefix: "icon",
    getRasters: getInactiveManifestRasters,
    svgPath: ICON_SVG_PATH,
  },
];
