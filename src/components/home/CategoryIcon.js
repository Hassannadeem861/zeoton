import { Armchair, Monitor, Cable, Gamepad2, Headphones, Keyboard, Mic, Mouse, Package, RectangleHorizontal } from 'lucide-react';

const ICONS = {
  'gaming-mice': Mouse,
  'gaming-keyboards': Keyboard,
  'gaming-headsets': Headphones,
  controllers: Gamepad2,
  'mouse-pads': RectangleHorizontal,
  'gaming-chairs': Armchair,
  'streaming-gear': Mic,
  'setup-accessories': Cable,
  'gaming-monitors': Monitor,
};

export default function CategoryIcon({ slug, className }) {
  const Icon = ICONS[slug] || Package;
  return <Icon className={className} aria-hidden strokeWidth={1.5} />;
}
