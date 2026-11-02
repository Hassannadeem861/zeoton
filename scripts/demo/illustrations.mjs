// Original vector product illustrations for DEMO products (no third-party photos).
// Each image is clearly watermarked "DEMO IMAGE". Rendered to raster by sharp, then
// passed through the same WebP optimizer used for admin uploads.

const S = 1200;
const C = S / 2;

const FINISHES = {
  black: { top: '#2a3245', mid: '#161c2a', bottom: '#0a0e16', edge: '#3a4560', key: '#1b2232', keyTop: '#2b344a', legend: '#9aa6bd' },
  white: { top: '#ffffff', mid: '#e3e7ef', bottom: '#b9c1cf', edge: '#ffffff', key: '#e8ecf3', keyTop: '#ffffff', legend: '#6b7489' },
  grey: { top: '#56607a', mid: '#3a4256', bottom: '#20263a', edge: '#6b7690', key: '#3b4459', keyTop: '#4f5a73', legend: '#cfd6e4' },
};

function defs(accent, f, uid) {
  return `
  <defs>
    <radialGradient id="bg${uid}" cx="50%" cy="40%" r="80%">
      <stop offset="0" stop-color="#17243f"/><stop offset="0.55" stop-color="#0b1220"/><stop offset="1" stop-color="#04060b"/>
    </radialGradient>
    <radialGradient id="bgAlt${uid}" cx="30%" cy="20%" r="95%">
      <stop offset="0" stop-color="#26324a"/><stop offset="0.6" stop-color="#121a2a"/><stop offset="1" stop-color="#070a12"/>
    </radialGradient>
    <radialGradient id="glow${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="body${uid}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${f.top}"/><stop offset="0.5" stop-color="${f.mid}"/><stop offset="1" stop-color="${f.bottom}"/>
    </linearGradient>
    <linearGradient id="bodyH${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${f.bottom}"/><stop offset="0.45" stop-color="${f.top}"/><stop offset="1" stop-color="${f.bottom}"/>
    </linearGradient>
    <linearGradient id="accentG${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="#8ab8ff"/>
    </linearGradient>
    <linearGradient id="screen${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1a3d"/><stop offset="0.5" stop-color="${accent}"/><stop offset="1" stop-color="#05070d"/>
    </linearGradient>
    <filter id="blur${uid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
    <filter id="soft${uid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <pattern id="grid${uid}" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0V60" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="2"/>
    </pattern>
  </defs>`;
}

// ---------- Product drawings (centred around 600,600) ----------

function mouse({ f, u, accent, opts }) {
  const mmo = opts.mmo;
  const body = 'M600 270 C 725 270 800 370 805 515 C 810 650 800 770 768 845 C 735 915 672 945 600 945 C 528 945 465 915 432 845 C 400 770 390 650 395 515 C 400 370 475 270 600 270 Z';
  const side = mmo
    ? Array.from({ length: 12 }, (_, i) => `<rect x="${398 + (i % 3) * 22}" y="${560 + Math.floor(i / 3) * 34}" width="18" height="26" rx="5" fill="${f.edge}" opacity="0.9"/>`).join('')
    : `<rect x="392" y="560" width="22" height="70" rx="9" fill="${f.edge}"/><rect x="392" y="642" width="22" height="60" rx="9" fill="${f.edge}"/>`;
  return `
  <ellipse cx="600" cy="960" rx="260" ry="34" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  <path d="${body}" fill="none" stroke="${accent}" stroke-width="18" opacity="0.7" filter="url(#soft${u})"/>
  <path d="${body}" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>
  <path d="M600 276 V 520" stroke="${f.bottom}" stroke-width="5"/>
  <path d="M402 530 Q 600 575 798 530" fill="none" stroke="${f.bottom}" stroke-width="4" opacity="0.8"/>
  <rect x="582" y="345" width="36" height="105" rx="18" fill="${f.bottom}"/>
  <rect x="590" y="355" width="20" height="85" rx="10" fill="url(#accentG${u})"/>
  ${opts.dpi !== false ? `<rect x="590" y="470" width="20" height="30" rx="6" fill="${f.edge}"/>` : ''}
  ${side}
  <path d="M470 330 C 500 300 560 290 590 292" stroke="#fff" stroke-opacity="0.25" stroke-width="10" fill="none" stroke-linecap="round"/>
  <g transform="translate(560 745) scale(0.32)" opacity="0.95">
    <path d="M59 0H254L212 35L31 179H0L24 137L153 35H23Z" fill="${f === FINISHES.white ? '#1b2232' : '#f5f7fb'}"/>
    <path d="M95 143H257L221 179H53Z" fill="${f === FINISHES.white ? '#1b2232' : '#f5f7fb'}"/>
    <path d="M201 59H236L154 125H119Z" fill="${accent}"/>
  </g>
  <path d="M440 860 Q 600 935 760 860" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity="0.95"/>`;
}

function keyboard({ f, u, accent, opts }) {
  const layout = opts.layout || 'tkl';
  const cols = { full: 18, tkl: 15, compact: 14 }[layout];
  const hasF = layout !== 'compact';
  const unit = layout === 'full' ? 48 : layout === 'tkl' ? 56 : 58;
  const pad = 26;
  const rows = [];
  if (hasF) rows.push(Array(cols).fill(1));
  rows.push([...Array(cols - 2).fill(1), 2]);
  rows.push([1.5, ...Array(cols - 3).fill(1), 1.5]);
  rows.push([1.75, ...Array(cols - 4).fill(1), 2.25]);
  rows.push([2.25, ...Array(cols - 5).fill(1), 2.75]);
  const bottom = [1.5, 1.25, 1.25, 6, 1.25, 1.25];
  let rem = cols - bottom.reduce((a, b) => a + b, 0);
  while (rem >= 1) { bottom.push(1); rem -= 1; }
  if (rem > 0) bottom[bottom.length - 1] += rem;
  rows.push(bottom);

  const W = cols * unit + pad * 2;
  const H = rows.length * unit + pad * 2;
  const x0 = C - W / 2;
  const y0 = C - H / 2;
  const accentKeys = new Set([`${hasF ? 2 : 1}-2`, `${hasF ? 3 : 2}-1`, `${hasF ? 3 : 2}-2`, `${hasF ? 3 : 2}-3`, '0-0']);
  let keys = '';
  rows.forEach((row, r) => {
    let x = x0 + pad;
    const y = y0 + pad + r * unit;
    row.forEach((w, i) => {
      const kw = w * unit - 6;
      const isAccent = accentKeys.has(`${r}-${i}`);
      keys += `<rect x="${x + 3}" y="${y + 3}" width="${kw}" height="${unit - 6}" rx="8" fill="${isAccent ? accent : f.key}"/>`;
      keys += `<rect x="${x + 8}" y="${y + 6}" width="${kw - 10}" height="${unit - 18}" rx="6" fill="${isAccent ? '#8ab8ff' : f.keyTop}" opacity="${isAccent ? 0.55 : 1}"/>`;
      x += w * unit;
    });
  });
  return `<g transform="translate(${C} ${C}) scale(1.15) translate(${-C} ${-C})">
  <rect x="${x0 - 10}" y="${y0 + H - 30}" width="${W + 20}" height="70" rx="30" fill="${accent}" opacity="0.6" filter="url(#blur${u})"/>
  <rect x="${x0}" y="${y0}" width="${W}" height="${H}" rx="26" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>
  <rect x="${x0 + 10}" y="${y0 + 10}" width="${W - 20}" height="${H - 20}" rx="18" fill="${f.bottom}" opacity="0.55"/>
  ${keys}
  <rect x="${x0}" y="${y0 + H - 6}" width="${W}" height="6" rx="3" fill="url(#accentG${u})" opacity="0.9"/></g>`;
}

function headset({ f, u, accent, opts }) {
  const mic = opts.mic !== false;
  return `
  <ellipse cx="600" cy="965" rx="300" ry="30" fill="#000" opacity="0.5" filter="url(#soft${u})"/>
  <path d="M370 640 C 360 300 840 300 830 640" fill="none" stroke="${f.bottom}" stroke-width="64" stroke-linecap="round"/>
  <path d="M370 640 C 360 300 840 300 830 640" fill="none" stroke="url(#bodyH${u})" stroke-width="46" stroke-linecap="round"/>
  <path d="M430 470 C 470 380 730 380 770 470" fill="none" stroke="${f.bottom}" stroke-width="30" stroke-linecap="round" opacity="0.8"/>
  ${[385, 815].map((cx) => `
    <rect x="${cx - 30}" y="520" width="60" height="90" rx="20" fill="${f.edge}"/>
    <ellipse cx="${cx}" cy="720" rx="120" ry="165" fill="${f.bottom}"/>
    <ellipse cx="${cx}" cy="712" rx="112" ry="155" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>
    <ellipse cx="${cx}" cy="712" rx="74" ry="108" fill="none" stroke="${accent}" stroke-width="12" opacity="0.95"/>
    <ellipse cx="${cx}" cy="712" rx="74" ry="108" fill="none" stroke="${accent}" stroke-width="22" opacity="0.4" filter="url(#soft${u})"/>
    <ellipse cx="${cx}" cy="712" rx="46" ry="70" fill="${f.mid}"/>`).join('')}
  ${mic ? `<path d="M330 820 C 300 900 360 960 470 950" fill="none" stroke="${f.bottom}" stroke-width="18" stroke-linecap="round"/>
  <rect x="455" y="925" width="60" height="44" rx="20" fill="${f.mid}" stroke="${accent}" stroke-width="4"/>` : ''}`;
}

function controller({ f, u, accent }) {
  const body = 'M360 450 C 430 405 520 420 600 430 C 680 420 770 405 840 450 C 915 500 970 690 985 800 C 1000 885 945 945 880 915 C 825 890 795 810 745 780 C 695 755 505 755 455 780 C 405 810 375 890 320 915 C 255 945 200 885 215 800 C 230 690 285 500 360 450 Z';
  const stick = (x, y) => `<circle cx="${x}" cy="${y}" r="62" fill="${f.bottom}"/><circle cx="${x}" cy="${y}" r="48" fill="${f.mid}" stroke="${f.edge}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="30" fill="${f.bottom}"/><circle cx="${x - 8}" cy="${y - 8}" r="10" fill="#fff" opacity="0.15"/>`;
  const btn = (x, y, c) => `<circle cx="${x}" cy="${y}" r="24" fill="${c}"/><circle cx="${x - 6}" cy="${y - 6}" r="8" fill="#fff" opacity="0.3"/>`;
  return `
  <ellipse cx="600" cy="960" rx="330" ry="34" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  <path d="${body}" fill="none" stroke="${accent}" stroke-width="20" opacity="0.6" filter="url(#soft${u})"/>
  <path d="${body}" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>
  ${stick(450, 575)}${stick(690, 690)}
  <g fill="${f.bottom}">
    <rect x="490" y="660" width="34" height="96" rx="8"/><rect x="459" y="691" width="96" height="34" rx="8"/>
  </g>
  ${btn(770, 535, accent)}${btn(820, 585, '#f04452')}${btn(720, 585, '#22c55e')}${btn(770, 635, '#f5a524')}
  <rect x="545" y="540" width="40" height="18" rx="9" fill="${f.edge}"/><rect x="615" y="540" width="40" height="18" rx="9" fill="${f.edge}"/>
  <path d="M520 455 Q 600 445 680 455" stroke="${accent}" stroke-width="10" stroke-linecap="round" fill="none"/>`;
}

function chair({ f, u, accent }) {
  return `
  <ellipse cx="600" cy="1010" rx="330" ry="36" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  <path d="M470 150 C 470 120 730 120 730 150 L 760 600 C 760 640 440 640 440 600 Z" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>
  <path d="M470 150 C 470 120 730 120 730 150 L 760 600 C 760 640 440 640 440 600 Z" fill="none" stroke="${accent}" stroke-width="10" opacity="0.5" filter="url(#soft${u})"/>
  <path d="M500 300 L 520 590 M700 300 L 680 590" stroke="${accent}" stroke-width="26" stroke-linecap="round"/>
  <rect x="530" y="185" width="140" height="70" rx="30" fill="${f.bottom}"/>
  <path d="M560 300 L 640 300 L 650 560 L 550 560 Z" fill="${f.bottom}" opacity="0.6"/>
  <path d="M560 300 L 640 300 M555 380 L 645 380 M552 460 L 648 460" stroke="${f.edge}" stroke-width="3" stroke-dasharray="10 8" opacity="0.6"/>
  <rect x="420" y="620" width="360" height="110" rx="40" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>
  <rect x="360" y="540" width="40" height="150" rx="14" fill="${f.mid}"/><rect x="330" y="530" width="110" height="34" rx="14" fill="${f.edge}"/>
  <rect x="800" y="540" width="40" height="150" rx="14" fill="${f.mid}"/><rect x="760" y="530" width="110" height="34" rx="14" fill="${f.edge}"/>
  <rect x="582" y="730" width="36" height="150" rx="10" fill="${f.edge}"/>
  <path d="M600 880 L 330 950 M600 880 L 450 990 M600 880 L 750 990 M600 880 L 870 950 M600 880 L 600 980" stroke="${f.mid}" stroke-width="26" stroke-linecap="round"/>
  ${[[330, 965], [450, 1005], [750, 1005], [870, 965], [600, 995]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="${f.bottom}" stroke="${f.edge}" stroke-width="3"/>`).join('')}`;
}

function monitor({ f, u, accent, opts }) {
  const curved = opts.curved;
  const w = opts.size === 'xl' ? 840 : opts.size === 'sm' ? 680 : 760;
  const h = Math.round(w * 0.56);
  const x0 = C - w / 2;
  const y0 = 230;
  const frame = curved
    ? `M${x0} ${y0} Q ${C} ${y0 + 40} ${x0 + w} ${y0} L ${x0 + w} ${y0 + h} Q ${C} ${y0 + h + 40} ${x0} ${y0 + h} Z`
    : `M${x0} ${y0} H ${x0 + w} V ${y0 + h} H ${x0} Z`;
  const inner = curved
    ? `M${x0 + 18} ${y0 + 18} Q ${C} ${y0 + 56} ${x0 + w - 18} ${y0 + 18} L ${x0 + w - 18} ${y0 + h - 18} Q ${C} ${y0 + h + 20} ${x0 + 18} ${y0 + h - 18} Z`
    : `M${x0 + 16} ${y0 + 16} H ${x0 + w - 16} V ${y0 + h - 28} H ${x0 + 16} Z`;
  return `
  <ellipse cx="600" cy="985" rx="300" ry="30" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  <rect x="${x0 + 40}" y="${y0 + 40}" width="${w - 80}" height="${h - 40}" fill="${accent}" opacity="0.45" filter="url(#blur${u})"/>
  <path d="${frame}" fill="#0b0f18" stroke="${f.edge}" stroke-width="4" stroke-linejoin="round"/>
  <path d="${inner}" fill="url(#screen${u})"/>
  <g opacity="0.9" transform="translate(${C - 120} ${y0 + h / 2 - 85}) scale(0.95)">
    <path d="M59 0H254L212 35L31 179H0L24 137L153 35H23Z" fill="#f5f7fb" opacity="0.9"/>
    <path d="M95 143H257L221 179H53Z" fill="#f5f7fb" opacity="0.9"/>
    <path d="M201 59H236L154 125H119Z" fill="#8ab8ff"/>
  </g>
  <path d="M${x0 + 16} ${y0 + 16} L ${x0 + w * 0.42} ${y0 + 16} L ${x0 + 16} ${y0 + h * 0.6} Z" fill="#fff" opacity="0.06"/>
  <rect x="575" y="${y0 + h + (curved ? 20 : 0)}" width="50" height="${880 - (y0 + h)}" rx="10" fill="url(#bodyH${u})"/>
  <path d="M440 905 Q 600 860 760 905 L 780 935 Q 600 905 420 935 Z" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>
  <rect x="${C - 30}" y="${y0 + h - 18 + (curved ? 18 : 0)}" width="60" height="5" rx="2.5" fill="${accent}"/>`;
}

function mousepad({ f, u, accent, opts }) {
  const xl = opts.size === 'xl';
  const w = xl ? 980 : 720;
  const h = xl ? 470 : 560;
  const x0 = C - w / 2;
  const y0 = C - h / 2 - (opts.wrist ? 60 : 0);
  return `
  <rect x="${x0 + 30}" y="${y0 + h - 10}" width="${w - 60}" height="40" fill="#000" opacity="0.6" filter="url(#soft${u})"/>
  <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="30" fill="#0d1220" stroke="${accent}" stroke-width="6"/>
  <rect x="${x0 + 14}" y="${y0 + 14}" width="${w - 28}" height="${h - 28}" rx="20" fill="url(#grid${u})" stroke="${accent}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="12 8"/>
  <path d="M${x0 + w * 0.55} ${y0 + 14} L ${x0 + w - 14} ${y0 + 14} L ${x0 + w - 14} ${y0 + h * 0.45} Z" fill="${accent}" opacity="0.25"/>
  <path d="M${x0 + w * 0.62} ${y0 + h - 14} L ${x0 + w * 0.92} ${y0 + h * 0.35}" stroke="${accent}" stroke-width="16" opacity="0.7" stroke-linecap="round"/>
  <g transform="translate(${x0 + 50} ${y0 + h - 110}) scale(0.32)">
    <path d="M59 0H254L212 35L31 179H0L24 137L153 35H23Z" fill="#f5f7fb" opacity="0.8"/><path d="M95 143H257L221 179H53Z" fill="#f5f7fb" opacity="0.8"/><path d="M201 59H236L154 125H119Z" fill="${accent}"/>
  </g>
  ${opts.wrist ? `<rect x="${x0 + 60}" y="${y0 + h + 30}" width="${w - 120}" height="110" rx="55" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>` : ''}`;
}

function microphone({ f, u, accent }) {
  return `
  <ellipse cx="600" cy="1000" rx="230" ry="30" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  <rect x="505" y="190" width="190" height="430" rx="95" fill="url(#bodyH${u})" stroke="${f.edge}" stroke-width="3"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M525 ${240 + i * 26} H 675" stroke="${f.bottom}" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`).join('')}
  <rect x="500" y="470" width="200" height="22" rx="11" fill="${accent}"/>
  <rect x="500" y="470" width="200" height="22" rx="11" fill="${accent}" filter="url(#soft${u})"/>
  <circle cx="600" cy="560" r="20" fill="${f.bottom}" stroke="${accent}" stroke-width="4"/>
  <path d="M470 560 Q 470 700 600 700 Q 730 700 730 560" fill="none" stroke="${f.mid}" stroke-width="22"/>
  <rect x="585" y="700" width="30" height="230" rx="10" fill="${f.mid}"/>
  <ellipse cx="600" cy="950" rx="190" ry="40" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>`;
}

function webcam({ f, u, accent }) {
  return `
  <ellipse cx="600" cy="900" rx="260" ry="30" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  <rect x="330" y="450" width="540" height="200" rx="100" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>
  <circle cx="600" cy="550" r="88" fill="${f.bottom}"/>
  <circle cx="600" cy="550" r="70" fill="#05070d" stroke="${accent}" stroke-width="6"/>
  <circle cx="600" cy="550" r="40" fill="url(#screen${u})"/>
  <circle cx="584" cy="532" r="12" fill="#fff" opacity="0.5"/>
  <circle cx="770" cy="550" r="10" fill="${accent}"/><circle cx="430" cy="550" r="10" fill="${f.edge}"/>
  <path d="M520 650 L 500 760 L 700 760 L 680 650 Z" fill="${f.mid}"/>
  <rect x="440" y="760" width="320" height="60" rx="18" fill="url(#body${u})" stroke="${f.edge}" stroke-width="3"/>`;
}

function stand({ f, u, accent }) {
  return `
  <ellipse cx="600" cy="980" rx="240" ry="30" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  <ellipse cx="600" cy="930" rx="200" ry="46" fill="${accent}" opacity="0.6" filter="url(#soft${u})"/>
  <ellipse cx="600" cy="920" rx="190" ry="44" fill="url(#body${u})" stroke="${accent}" stroke-width="6"/>
  <rect x="580" y="320" width="40" height="600" rx="14" fill="url(#bodyH${u})"/>
  <path d="M480 330 Q 600 230 720 330" fill="none" stroke="${f.mid}" stroke-width="44" stroke-linecap="round"/>
  <path d="M480 330 Q 600 230 720 330" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>`;
}

function bungee({ f, u, accent }) {
  return `
  <ellipse cx="600" cy="940" rx="230" ry="30" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  <ellipse cx="600" cy="880" rx="190" ry="60" fill="url(#body${u})" stroke="${accent}" stroke-width="5"/>
  <path d="M600 860 C 600 700 640 560 720 450" fill="none" stroke="${f.edge}" stroke-width="16" stroke-dasharray="6 6"/>
  <rect x="690" y="410" width="90" height="56" rx="20" fill="${f.mid}" stroke="${accent}" stroke-width="4"/>
  <path d="M735 440 C 900 420 980 520 1050 520" fill="none" stroke="${f.bottom}" stroke-width="10"/>
  <path d="M735 440 C 600 470 420 420 160 470" fill="none" stroke="${f.bottom}" stroke-width="10"/>`;
}

function lightbars({ u, accent }) {
  return `
  <ellipse cx="600" cy="960" rx="320" ry="30" fill="#000" opacity="0.55" filter="url(#soft${u})"/>
  ${[440, 760].map((x) => `
    <rect x="${x - 60}" y="250" width="120" height="640" rx="40" fill="${accent}" opacity="0.5" filter="url(#blur${u})"/>
    <rect x="${x - 34}" y="260" width="68" height="620" rx="30" fill="#141a28" stroke="#3a4560" stroke-width="3"/>
    <rect x="${x - 18}" y="290" width="36" height="560" rx="18" fill="url(#accentG${u})"/>
    <ellipse cx="${x}" cy="905" rx="90" ry="26" fill="#1c2433" stroke="#3a4560" stroke-width="3"/>`).join('')}`;
}

const DRAW = { mouse, keyboard, headset, controller, chair, monitor, mousepad, microphone, webcam, stand, bungee, lightbars };

/**
 * @param {{ type: keyof DRAW, accent?: string, finish?: 'black'|'white'|'grey', view?: 'main'|'alt', opts?: object }} spec
 */
export function renderProductSvg({ type, accent = '#0a6ffd', finish = 'black', view = 'main', opts = {} }) {
  const f = FINISHES[finish] || FINISHES.black;
  const u = `${type}${view}`;
  const drawing = DRAW[type]({ f, u, accent, opts });
  const transform = view === 'alt' ? `translate(${C} ${C}) rotate(-14) scale(0.96) translate(${-C} ${-C})` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  ${defs(accent, f, u)}
  <rect width="${S}" height="${S}" fill="url(#${view === 'alt' ? 'bgAlt' : 'bg'}${u})"/>
  <rect width="${S}" height="${S}" fill="url(#grid${u})"/>
  <circle cx="${C}" cy="${C}" r="430" fill="url(#glow${u})" opacity="${view === 'alt' ? 0.55 : 0.8}"/>
  ${view === 'alt' ? `<path d="M0 ${S * 0.82} L ${S} ${S * 0.6} L ${S} ${S * 0.6 + 6} L 0 ${S * 0.82 + 6} Z" fill="${accent}" opacity="0.35"/>` : ''}
  <g transform="${transform}">${drawing}</g>
  <g font-family="Arial, Helvetica, sans-serif" font-weight="700">
    <rect x="${S - 250}" y="${S - 82}" width="214" height="48" rx="10" fill="#000" fill-opacity="0.45" stroke="#f5a524" stroke-opacity="0.8"/>
    <text x="${S - 143}" y="${S - 50}" text-anchor="middle" font-size="22" letter-spacing="4" fill="#f5a524">DEMO IMAGE</text>
  </g>
</svg>`;
}
