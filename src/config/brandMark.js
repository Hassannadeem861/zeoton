// Z mark geometry traced from the supplied logo (source image coordinates).
// Shared by the SVG logo and the Three.js hero so both stay identical.
export const MARK_VIEWBOX = { x: 231, y: 14, width: 257, height: 179 };

export const MARK_POLYGONS = {
  upper: [[290, 14], [485, 14], [443, 49], [262, 193], [231, 193], [255, 151], [384, 49], [254, 49]],
  lower: [[326, 157], [488, 157], [452, 193], [284, 193]],
  stripe: [[432, 73], [467, 73], [385, 139], [350, 139]],
};

export const toSvgPath = (points) => `M${points.map(([x, y]) => `${x} ${y}`).join('L')}Z`;
