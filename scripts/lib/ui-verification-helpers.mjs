export const uiViewportInventory = [
  { name: "minimum-mobile", width: 320, height: 800 },
  { name: "android-360", width: 360, height: 800 },
  { name: "iphone-se", width: 375, height: 667 },
  { name: "mobile", width: 390, height: 844 },
  { name: "iphone-12", width: 390, height: 844, aliasFor: "mobile" },
  { name: "android-412", width: 412, height: 915 },
  { name: "iphone-14-plus", width: 428, height: 926 },
  { name: "android-tablet", width: 600, height: 960 },
  { name: "ipad-mini", width: 744, height: 1133 },
  { name: "tablet", width: 768, height: 900 },
  { name: "ipad-9", width: 768, height: 1024 },
  { name: "ipad-air", width: 820, height: 1180 },
  { name: "ipad-pro-11", width: 834, height: 1194 },
  { name: "tablet-wide", width: 1024, height: 900 },
  { name: "ipad-pro-12", width: 1024, height: 1366 },
  { name: "tablet-landscape", width: 1280, height: 800 },
  { name: "desktop", width: 1440, height: 1000 },
  { name: "wide-desktop", width: 1920, height: 1080 },
];

export const publicUiRoutes = [
  "/",
  "/guide/pink-princess",
  "/guide/violin-variegated/step/8",
  "/find",
  "/start",
  "/substances",
  "/problem",
  "/search",
  "/form/climbing-vine-visible-node",
];

export const authenticatedDirectUiRoutes = [
  "/my/equipment",
  "/my/rounds",
  "/my/rounds/new",
  "/my/trials/new",
  "/admin/pin",
  "/admin/manual/pink-princess",
];

export const requiredUiRoutes = [
  "/my",
  "/admin/knowledge",
  "/admin/research",
  "/admin/dataset-review",
  ...publicUiRoutes,
  ...authenticatedDirectUiRoutes,
];

export function selectViewports(selector) {
  if (selector) {
    const selected = uiViewportInventory.filter((viewport) => viewport.name === selector);
    if (selected.length === 0) throw new Error(`Unknown UI_VIEWPORT: ${selector}`);
    return selected;
  }
  return uiViewportInventory.filter((viewport) => !viewport.aliasFor);
}
