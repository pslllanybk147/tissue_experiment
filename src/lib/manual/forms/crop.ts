import type { FormImage } from "./types";

/** คืนค่า background ที่ทำให้จุด point อยู่กลางช่องซูมพอดี
 *
 *  ไม่ใช้ background-position แบบเปอร์เซ็นต์ เพราะเปอร์เซ็นต์ของ CSS จัดให้
 *  จุด p ของภาพไปตรงกับจุด p ของกรอบ ซึ่งไม่ใช่การวางจุดนั้นไว้กลางกรอบ
 *  จุดที่อยู่ริมภาพจะเพี้ยนหนักที่สุด คำนวณเป็นพิกเซลจึงได้ค่าที่ตรงทุกจุด */
export function cropStyle(
  point: { x: number; y: number },
  image: Pick<FormImage, "width" | "height">,
  swatchPx = 72,
  zoom = 3,
): { backgroundSize: string; backgroundPosition: string } {
  const displayedWidth = swatchPx * zoom;
  const displayedHeight = displayedWidth * (image.height / image.width);
  const centre = swatchPx / 2;

  const left = centre - point.x * displayedWidth;
  const top = centre - point.y * displayedHeight;

  return {
    backgroundSize: `${displayedWidth}px ${displayedHeight}px`,
    backgroundPosition: `${left}px ${top}px`,
  };
}
