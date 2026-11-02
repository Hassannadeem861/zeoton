import { MARK_POLYGONS, MARK_VIEWBOX, toSvgPath } from '@/config/brandMark';

const viewBox = `${MARK_VIEWBOX.x} ${MARK_VIEWBOX.y} ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`;

export default function BrandMark({ className, title, accent = 'var(--color-blue-500)' }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      <path d={toSvgPath(MARK_POLYGONS.upper)} />
      <path d={toSvgPath(MARK_POLYGONS.lower)} />
      <path d={toSvgPath(MARK_POLYGONS.stripe)} fill={accent} />
    </svg>
  );
}
