// DEMO catalog for client design review. Brands are fictional; names, prices (PKR),
// specifications and stock are placeholders — NOT real ZEOTON inventory.

export const DEMO_DISCLAIMER =
  'This is a demo product created for website design review. The brand, name, price, specifications, images and stock are placeholders and do not represent real ZEOTON inventory.';

// Subcategories under the real top-level categories, plus one demo top-level category.
export const demoCategories = [
  { slug: 'wireless-gaming-mice', name: 'Wireless Gaming Mice', parentSlug: 'gaming-mice', sortOrder: 1 },
  { slug: 'wired-gaming-mice', name: 'Wired Gaming Mice', parentSlug: 'gaming-mice', sortOrder: 2 },
  { slug: 'mechanical-keyboards', name: 'Mechanical Keyboards', parentSlug: 'gaming-keyboards', sortOrder: 1 },
  { slug: 'compact-keyboards', name: 'Compact & 65% Keyboards', parentSlug: 'gaming-keyboards', sortOrder: 2 },
  { slug: 'wireless-gaming-headsets', name: 'Wireless Headsets', parentSlug: 'gaming-headsets', sortOrder: 1 },
  { slug: 'wired-gaming-headsets', name: 'Wired Headsets', parentSlug: 'gaming-headsets', sortOrder: 2 },
  { slug: 'pc-controllers', name: 'PC & Console Controllers', parentSlug: 'controllers', sortOrder: 1 },
  { slug: 'mobile-controllers', name: 'Mobile Controllers', parentSlug: 'controllers', sortOrder: 2 },
  {
    slug: 'gaming-monitors',
    name: 'Gaming Monitors',
    parentSlug: null,
    sortOrder: 9,
    description: 'High-refresh gaming monitors in Full HD and QHD. Compare size, refresh rate, panel type and response time.',
    seo: { title: 'Gaming Monitor Price in Pakistan', description: 'Gaming monitors in Pakistan: compare refresh rate, resolution and panel type with prices in PKR.' },
  },
];

const desc = (intro, detail) => `${intro}\n\n${detail}\n\n${DEMO_DISCLAIMER}`;

// art: illustration spec (type, accent, finish, opts) — see illustrations.mjs
export const demoProducts = [
  // ---------- Gaming mice ----------
  {
    sku: 'DEMO-MS-001', name: 'Vantix Phantom Pro Wireless Gaming Mouse', brand: 'Vantix', category: 'gaming-mice', subcategory: 'wireless-gaming-mice',
    price: 14999, salePrice: 12999, isFeatured: true, tags: ['wireless', 'lightweight', 'fps'],
    shortDescription: 'Lightweight tri-mode wireless mouse with a high-precision optical sensor for competitive FPS games.',
    description: desc('A symmetrical, lightweight wireless mouse built for fast flicks and long sessions.', 'Switch between 2.4 GHz wireless, Bluetooth and USB-C wired play, and fine-tune DPI on the fly with the button below the scroll wheel.'),
    specs: [['Sensor', 'Optical, up to 26,000 DPI'], ['Polling rate', '1,000 Hz'], ['Connectivity', '2.4 GHz wireless, Bluetooth, USB-C'], ['Weight', '63 g'], ['Buttons', '5 programmable'], ['Battery', 'Up to 90 hours (2.4 GHz)']],
    variants: [{ label: 'Black', sku: 'DEMO-MS-001-BK', stock: 12 }, { label: 'White', sku: 'DEMO-MS-001-WH', stock: 6 }],
    art: { type: 'mouse', accent: '#0a6ffd' }, artAlt: { type: 'mouse', finish: 'white', accent: '#0a6ffd' },
  },
  {
    sku: 'DEMO-MS-002', name: 'Kyrex Viper Lite Wired Gaming Mouse', brand: 'Kyrex', category: 'gaming-mice', subcategory: 'wired-gaming-mice',
    price: 4499, stock: 30, tags: ['wired', 'lightweight', 'budget'],
    shortDescription: 'Ultra-light wired mouse with a flexible paracord-style cable and low-friction feet.',
    description: desc('A no-nonsense wired mouse for players who want low weight and zero latency without paying for wireless.', 'The flexible cable and PTFE feet keep movement smooth on any mouse pad.'),
    specs: [['Sensor', 'Optical, up to 12,400 DPI'], ['Polling rate', '1,000 Hz'], ['Connectivity', 'USB-A wired'], ['Weight', '58 g'], ['Cable', '1.8 m flexible braided'], ['Buttons', '6']],
    art: { type: 'mouse', accent: '#22c55e' },
  },
  {
    sku: 'DEMO-MS-003', name: 'Nordbyte Glide X2 Wireless Mouse', brand: 'Nordbyte', category: 'gaming-mice', subcategory: 'wireless-gaming-mice',
    price: 8999, stock: 4, tags: ['wireless', 'ergonomic'],
    shortDescription: 'Ergonomic right-handed wireless mouse with RGB lighting and USB-C fast charging.',
    description: desc('A sculpted right-handed shape that supports palm grip for comfortable all-day use.', 'RGB lighting can be customised or switched off to extend battery life.'),
    specs: [['Sensor', 'Optical, up to 18,000 DPI'], ['Connectivity', '2.4 GHz wireless, USB-C'], ['Weight', '74 g'], ['Shape', 'Right-handed ergonomic'], ['Lighting', 'RGB']],
    art: { type: 'mouse', accent: '#06b6d4', finish: 'grey' },
  },
  {
    sku: 'DEMO-MS-004', name: 'Strato Raptor RGB Gaming Mouse', brand: 'Strato', category: 'gaming-mice', subcategory: 'wired-gaming-mice',
    price: 3299, salePrice: 2799, stock: 25, tags: ['wired', 'rgb', 'budget'],
    shortDescription: 'Budget-friendly wired RGB mouse with adjustable DPI and six buttons.',
    description: desc('An entry-level gaming mouse with the essentials: adjustable DPI, side buttons and RGB lighting.', 'A good first gaming mouse for new PC setups.'),
    specs: [['Sensor', 'Optical, up to 7,200 DPI'], ['Connectivity', 'USB-A wired'], ['Weight', '85 g'], ['Buttons', '6'], ['Lighting', 'RGB']],
    art: { type: 'mouse', accent: '#f04452' },
  },
  {
    sku: 'DEMO-MS-005', name: 'Vantix Titan MMO Gaming Mouse', brand: 'Vantix', category: 'gaming-mice', subcategory: 'wired-gaming-mice',
    price: 7499, stock: 0, tags: ['mmo', 'wired', 'side buttons'],
    shortDescription: 'MMO mouse with a 12-button side panel for abilities and macros.',
    description: desc('Built for MMO and MOBA players who need many binds within thumb reach.', 'Every button can be remapped and stored in onboard profiles.'),
    specs: [['Sensor', 'Optical, up to 16,000 DPI'], ['Buttons', '17 (12 side buttons)'], ['Connectivity', 'USB-A wired'], ['Weight', '110 g']],
    art: { type: 'mouse', accent: '#a855f7', opts: { mmo: true } },
  },
  {
    sku: 'DEMO-MS-006', name: 'Kyrex Aero Mini Wireless Mouse', brand: 'Kyrex', category: 'gaming-mice', subcategory: 'wireless-gaming-mice',
    price: 6499, stock: 15, tags: ['wireless', 'small hands', 'lightweight'],
    shortDescription: 'Compact 55 g wireless mouse for small to medium hands and claw grip.',
    description: desc('A small, lightweight shell suited to claw and fingertip grips.', 'Includes a 2.4 GHz receiver and a USB-C charging cable.'),
    specs: [['Sensor', 'Optical, up to 16,000 DPI'], ['Connectivity', '2.4 GHz wireless, USB-C'], ['Weight', '55 g'], ['Size', 'Small']],
    art: { type: 'mouse', finish: 'white', accent: '#ec4899' },
  },

  // ---------- Keyboards ----------
  {
    sku: 'DEMO-KB-001', name: 'Vantix Forge TKL Mechanical Gaming Keyboard', brand: 'Vantix', category: 'gaming-keyboards', subcategory: 'mechanical-keyboards',
    price: 15999, isFeatured: true, tags: ['mechanical', 'tkl', 'hot-swappable', 'rgb'],
    shortDescription: 'Tenkeyless mechanical keyboard with hot-swappable switches and per-key RGB.',
    description: desc('A compact tenkeyless layout leaves more desk space for low-sensitivity aiming.', 'Hot-swappable sockets let you change switches without soldering.'),
    specs: [['Layout', 'Tenkeyless (87 keys)'], ['Switches', 'Mechanical, hot-swappable'], ['Keycaps', 'Double-shot PBT'], ['Lighting', 'Per-key RGB'], ['Connection', 'USB-C detachable']],
    variants: [{ label: 'Red (linear)', sku: 'DEMO-KB-001-RD', stock: 8 }, { label: 'Brown (tactile)', sku: 'DEMO-KB-001-BR', stock: 5 }, { label: 'Blue (clicky)', sku: 'DEMO-KB-001-BL', stock: 0 }],
    art: { type: 'keyboard', opts: { layout: 'tkl' } },
  },
  {
    sku: 'DEMO-KB-002', name: 'Kyrex K65 Wireless Compact Keyboard', brand: 'Kyrex', category: 'gaming-keyboards', subcategory: 'compact-keyboards',
    price: 13499, salePrice: 11999, stock: 10, tags: ['wireless', '65%', 'mechanical'],
    shortDescription: '65% wireless mechanical keyboard with arrow keys and tri-mode connectivity.',
    description: desc('A 65% layout keeps the arrow keys while saving space.', 'Connect over 2.4 GHz, Bluetooth or USB-C.'),
    specs: [['Layout', '65% (68 keys)'], ['Connectivity', '2.4 GHz, Bluetooth, USB-C'], ['Switches', 'Mechanical linear'], ['Battery', '4,000 mAh']],
    art: { type: 'keyboard', finish: 'white', accent: '#ec4899', opts: { layout: 'compact' } },
  },
  {
    sku: 'DEMO-KB-003', name: 'Nordbyte Full-Size RGB Mechanical Keyboard', brand: 'Nordbyte', category: 'gaming-keyboards', subcategory: 'mechanical-keyboards',
    price: 9999, stock: 14, tags: ['mechanical', 'full size', 'numpad'],
    shortDescription: 'Full-size mechanical keyboard with numpad, media keys and RGB.',
    description: desc('A full layout with a number pad for players who also work, study or edit on the same PC.', 'Includes a detachable wrist rest.'),
    specs: [['Layout', 'Full-size (104 keys)'], ['Switches', 'Mechanical'], ['Lighting', 'RGB'], ['Extras', 'Media keys, wrist rest']],
    art: { type: 'keyboard', accent: '#22c55e', opts: { layout: 'full' } },
  },
  {
    sku: 'DEMO-KB-004', name: 'Strato Membrane Pro RGB Keyboard', brand: 'Strato', category: 'gaming-keyboards', subcategory: null,
    price: 3999, stock: 40, tags: ['membrane', 'budget', 'rgb'],
    shortDescription: 'Quiet membrane gaming keyboard with spill resistance and RGB zones.',
    description: desc('A budget-friendly full-size keyboard with quiet keys.', 'Anti-ghosting on gaming keys and a spill-resistant design.'),
    specs: [['Layout', 'Full-size'], ['Switches', 'Membrane'], ['Lighting', '3-zone RGB'], ['Connection', 'USB-A']],
    art: { type: 'keyboard', accent: '#f5a524', finish: 'grey', opts: { layout: 'full' } },
  },
  {
    sku: 'DEMO-KB-005', name: 'Vantix Rapid 60 Magnetic Keyboard', brand: 'Vantix', category: 'gaming-keyboards', subcategory: 'compact-keyboards',
    price: 18999, stock: 3, tags: ['magnetic', 'rapid trigger', 'compact'],
    shortDescription: 'Compact keyboard with adjustable-actuation magnetic switches.',
    description: desc('Magnetic Hall-effect switches with adjustable actuation for very fast inputs.', 'A compact layout for maximum mouse space.'),
    specs: [['Layout', 'Compact'], ['Switches', 'Magnetic (Hall effect)'], ['Actuation', 'Adjustable'], ['Connection', 'USB-C']],
    art: { type: 'keyboard', accent: '#06b6d4', opts: { layout: 'compact' } },
  },
  {
    sku: 'DEMO-KB-006', name: 'Kyrex Typer TKL Keyboard — White', brand: 'Kyrex', category: 'gaming-keyboards', subcategory: 'mechanical-keyboards',
    price: 7999, stock: 9, tags: ['white', 'tkl', 'mechanical'],
    shortDescription: 'White tenkeyless mechanical keyboard for clean, light-coloured setups.',
    description: desc('A clean white TKL keyboard that matches light-themed setups.', 'Tactile switches suit both typing and gaming.'),
    specs: [['Layout', 'Tenkeyless'], ['Switches', 'Mechanical tactile'], ['Colour', 'White'], ['Lighting', 'White LED']],
    art: { type: 'keyboard', finish: 'white', accent: '#0a6ffd', opts: { layout: 'tkl' } },
  },

  // ---------- Headsets ----------
  {
    sku: 'DEMO-HS-001', name: 'Vantix Echo 7.1 Wireless Gaming Headset', brand: 'Vantix', category: 'gaming-headsets', subcategory: 'wireless-gaming-headsets',
    price: 17999, salePrice: 15999, stock: 7, isFeatured: true, tags: ['wireless', 'with mic', 'surround'],
    shortDescription: 'Wireless headset with virtual 7.1 surround and a detachable noise-reducing mic.',
    description: desc('Low-latency wireless audio with virtual surround for positional sound.', 'Memory-foam ear cushions and a detachable microphone.'),
    specs: [['Connectivity', '2.4 GHz wireless, Bluetooth'], ['Drivers', '50 mm'], ['Microphone', 'Detachable, noise reducing'], ['Battery', 'Up to 40 hours'], ['Compatibility', 'PC, PS5, mobile']],
    art: { type: 'headset', opts: { mic: true } },
  },
  {
    sku: 'DEMO-HS-002', name: 'Kyrex Cloud Wired Gaming Headset', brand: 'Kyrex', category: 'gaming-headsets', subcategory: 'wired-gaming-headsets',
    price: 6999, stock: 22, tags: ['wired', 'with mic', '3.5mm'],
    shortDescription: 'Comfortable wired headset with 3.5 mm jack for PC, console and mobile.',
    description: desc('A versatile wired headset that works with almost any device through a 3.5 mm jack.', 'Includes an in-line volume and mute control.'),
    specs: [['Connection', '3.5 mm'], ['Drivers', '53 mm'], ['Microphone', 'Detachable'], ['Compatibility', 'PC, consoles, mobile']],
    art: { type: 'headset', accent: '#f04452', opts: { mic: true } },
  },
  {
    sku: 'DEMO-HS-003', name: 'Nordbyte Pulse Wireless Headset — White', brand: 'Nordbyte', category: 'gaming-headsets', subcategory: 'wireless-gaming-headsets',
    price: 11499, stock: 5, tags: ['wireless', 'white'],
    shortDescription: 'Lightweight white wireless headset with a flip-to-mute microphone.',
    description: desc('A light, comfortable wireless headset in white.', 'Flip the mic up to mute instantly.'),
    specs: [['Connectivity', '2.4 GHz wireless'], ['Weight', '270 g'], ['Microphone', 'Flip-to-mute'], ['Battery', 'Up to 30 hours']],
    art: { type: 'headset', finish: 'white', accent: '#a855f7', opts: { mic: true } },
  },
  {
    sku: 'DEMO-HS-004', name: 'Strato Bass RGB USB Headset', brand: 'Strato', category: 'gaming-headsets', subcategory: 'wired-gaming-headsets',
    price: 4299, stock: 18, tags: ['usb', 'rgb', 'budget'],
    shortDescription: 'USB gaming headset with RGB ear cups and an adjustable microphone.',
    description: desc('Plug-and-play USB headset for PC with RGB ear cups.', 'An adjustable boom mic for voice chat.'),
    specs: [['Connection', 'USB-A'], ['Drivers', '50 mm'], ['Lighting', 'RGB'], ['Microphone', 'Adjustable boom']],
    art: { type: 'headset', accent: '#22c55e', finish: 'grey', opts: { mic: true } },
  },
  {
    sku: 'DEMO-HS-005', name: 'Kyrex Cloud Mobile Lite Headset', brand: 'Kyrex', category: 'gaming-headsets', subcategory: 'wired-gaming-headsets',
    price: 2499, stock: 50, tags: ['mobile', 'with mic', 'budget'],
    shortDescription: 'Light wired headset with mic for mobile gaming and calls.',
    description: desc('An affordable headset for mobile gaming with a clear in-line microphone.', 'Folds flat for carrying.'),
    specs: [['Connection', '3.5 mm'], ['Microphone', 'In-line'], ['Compatibility', 'Mobile, PC'], ['Weight', '190 g']],
    art: { type: 'headset', accent: '#06b6d4', opts: { mic: false } },
  },

  // ---------- Controllers ----------
  {
    sku: 'DEMO-GP-001', name: 'Vantix Nova Pro Wireless Controller', brand: 'Vantix', category: 'controllers', subcategory: 'pc-controllers',
    price: 9999, isFeatured: true, tags: ['wireless', 'pc', 'hall effect'],
    shortDescription: 'Wireless controller for PC with Hall-effect sticks and rear paddles.',
    description: desc('Hall-effect thumbsticks help prevent stick drift.', 'Two rear paddles can be mapped to any button.'),
    specs: [['Connectivity', '2.4 GHz wireless, Bluetooth, USB-C'], ['Sticks', 'Hall effect'], ['Extras', '2 rear paddles'], ['Battery', 'Up to 20 hours'], ['Compatibility', 'PC, mobile']],
    variants: [{ label: 'Black', sku: 'DEMO-GP-001-BK', stock: 10 }, { label: 'White', sku: 'DEMO-GP-001-WH', stock: 4 }],
    art: { type: 'controller' }, artAlt: { type: 'controller', finish: 'white' },
  },
  {
    sku: 'DEMO-GP-002', name: 'Kyrex Hall-Effect Wired Controller', brand: 'Kyrex', category: 'controllers', subcategory: 'pc-controllers',
    price: 5499, stock: 16, tags: ['wired', 'pc'],
    shortDescription: 'Wired PC controller with drift-resistant sticks and a 3 m cable.',
    description: desc('A reliable wired controller with a long cable for couch gaming.', 'Hall-effect sticks and triggers.'),
    specs: [['Connection', 'USB-C wired (3 m cable)'], ['Sticks', 'Hall effect'], ['Compatibility', 'PC']],
    art: { type: 'controller', accent: '#22c55e', finish: 'grey' },
  },
  {
    sku: 'DEMO-GP-003', name: 'Nordbyte Stretch Mobile Controller', brand: 'Nordbyte', category: 'controllers', subcategory: 'mobile-controllers',
    price: 7999, salePrice: 6999, stock: 12, tags: ['mobile', 'telescopic'],
    shortDescription: 'Telescopic controller that holds your phone for console-style mobile gaming.',
    description: desc('Stretches to fit most phones and connects over USB-C for low latency.', 'Pass-through charging keeps your phone powered while you play.'),
    specs: [['Connection', 'USB-C'], ['Fits', 'Phones up to 6.9"'], ['Extras', 'Pass-through charging']],
    art: { type: 'controller', accent: '#f04452' },
  },
  {
    sku: 'DEMO-GP-004', name: 'Strato Basic USB Gamepad', brand: 'Strato', category: 'controllers', subcategory: 'pc-controllers',
    price: 2199, stock: 35, tags: ['budget', 'usb', 'pc'],
    shortDescription: 'Simple plug-and-play USB gamepad for PC and laptops.',
    description: desc('An affordable USB gamepad for casual and emulator gaming.', 'Works with most PC games that support controllers.'),
    specs: [['Connection', 'USB-A wired'], ['Compatibility', 'PC, laptop']],
    art: { type: 'controller', accent: '#f5a524' },
  },

  // ---------- Chairs ----------
  {
    sku: 'DEMO-CH-001', name: 'Vantix Throne Ergonomic Gaming Chair', brand: 'Vantix', category: 'gaming-chairs', subcategory: null,
    price: 54999, salePrice: 49999, isFeatured: true, tags: ['ergonomic', 'recline', '4d armrests'],
    shortDescription: 'Ergonomic gaming chair with 4D armrests, lumbar support and 165° recline.',
    description: desc('Supportive cold-cure foam and an adjustable lumbar cushion for long sessions.', '4D armrests, 165° recline and a class-4 gas lift.'),
    specs: [['Recline', 'Up to 165°'], ['Armrests', '4D adjustable'], ['Max load', '150 kg'], ['Upholstery', 'PU leather'], ['Base', 'Aluminium, 5-star']],
    variants: [{ label: 'Black / Blue', sku: 'DEMO-CH-001-BB', stock: 5 }, { label: 'Black / Red', sku: 'DEMO-CH-001-BR', stock: 3 }],
    art: { type: 'chair', accent: '#0a6ffd' }, artAlt: { type: 'chair', accent: '#f04452' },
  },
  {
    sku: 'DEMO-CH-002', name: 'Kyrex Racer Gaming Chair', brand: 'Kyrex', category: 'gaming-chairs', subcategory: null,
    price: 34999, stock: 6, tags: ['racing style'],
    shortDescription: 'Racing-style gaming chair with headrest and lumbar pillows.',
    description: desc('A classic racing-style chair with removable pillows.', 'Adjustable height, tilt lock and 2D armrests.'),
    specs: [['Recline', 'Up to 155°'], ['Armrests', '2D adjustable'], ['Max load', '120 kg']],
    art: { type: 'chair', accent: '#f04452' },
  },
  {
    sku: 'DEMO-CH-003', name: 'Nordbyte Breathable Fabric Gaming Chair', brand: 'Nordbyte', category: 'gaming-chairs', subcategory: null,
    price: 42999, stock: 2, tags: ['fabric', 'breathable'],
    shortDescription: 'Fabric gaming chair that stays cooler in Pakistani summers.',
    description: desc('Breathable fabric upholstery for hot weather.', 'Integrated lumbar support and 3D armrests.'),
    specs: [['Upholstery', 'Breathable fabric'], ['Armrests', '3D'], ['Max load', '130 kg']],
    art: { type: 'chair', accent: '#22c55e', finish: 'grey' },
  },

  // ---------- Monitors (demo category) ----------
  {
    sku: 'DEMO-MN-001', name: 'Vantix Vision 27" QHD 170 Hz IPS Gaming Monitor', brand: 'Vantix', category: 'gaming-monitors', subcategory: null,
    price: 74999, salePrice: 69999, stock: 6, isFeatured: true, tags: ['27 inch', 'qhd', '170hz', 'ips'],
    shortDescription: '27-inch QHD IPS monitor with 170 Hz refresh rate and adaptive sync.',
    description: desc('Sharp QHD resolution and fast IPS response for competitive and story games.', 'Height-adjustable stand and adaptive sync support.'),
    specs: [['Size', '27"'], ['Resolution', '2560 × 1440 (QHD)'], ['Refresh rate', '170 Hz'], ['Panel', 'IPS'], ['Response time', '1 ms (GtG)'], ['Ports', '2× HDMI 2.0, DisplayPort 1.4']],
    art: { type: 'monitor' },
  },
  {
    sku: 'DEMO-MN-002', name: 'Kyrex 24" FHD 165 Hz Gaming Monitor', brand: 'Kyrex', category: 'gaming-monitors', subcategory: null,
    price: 39999, stock: 11, tags: ['24 inch', 'fhd', '165hz'],
    shortDescription: '24-inch Full HD monitor with 165 Hz refresh rate for esports titles.',
    description: desc('A popular size and resolution for competitive games at high frame rates.', 'Slim bezels for multi-monitor setups.'),
    specs: [['Size', '24"'], ['Resolution', '1920 × 1080 (FHD)'], ['Refresh rate', '165 Hz'], ['Panel', 'IPS']],
    art: { type: 'monitor', accent: '#22c55e', opts: { size: 'sm' } },
  },
  {
    sku: 'DEMO-MN-003', name: 'Nordbyte 32" Curved QHD 165 Hz Monitor', brand: 'Nordbyte', category: 'gaming-monitors', subcategory: null,
    price: 89999, stock: 3, tags: ['32 inch', 'curved', 'qhd'],
    shortDescription: '32-inch curved QHD VA monitor for immersive gaming.',
    description: desc('A large curved screen that fills your field of view.', 'High-contrast VA panel for deep blacks.'),
    specs: [['Size', '32" curved (1500R)'], ['Resolution', '2560 × 1440 (QHD)'], ['Refresh rate', '165 Hz'], ['Panel', 'VA']],
    art: { type: 'monitor', accent: '#a855f7', opts: { curved: true, size: 'xl' } },
  },
  {
    sku: 'DEMO-MN-004', name: 'Strato 24.5" 240 Hz Esports Monitor', brand: 'Strato', category: 'gaming-monitors', subcategory: null,
    price: 59999, stock: 4, tags: ['240hz', 'esports'],
    shortDescription: '24.5-inch 240 Hz monitor for high-frame-rate esports play.',
    description: desc('Very high refresh rate for players chasing every frame.', 'Low input lag and a compact stand.'),
    specs: [['Size', '24.5"'], ['Resolution', '1920 × 1080'], ['Refresh rate', '240 Hz'], ['Response time', '1 ms']],
    art: { type: 'monitor', accent: '#f04452', opts: { size: 'sm' } },
  },

  // ---------- Mouse pads ----------
  {
    sku: 'DEMO-MP-001', name: 'Vantix Control XL Desk Mat (900 × 400 mm)', brand: 'Vantix', category: 'mouse-pads', subcategory: null,
    price: 3499, stock: 30, tags: ['xl', 'desk mat', 'control'],
    shortDescription: 'Extra-large control-surface desk mat with stitched edges.',
    description: desc('Covers keyboard and mouse area with a consistent control surface.', 'Stitched edges and a non-slip rubber base.'),
    specs: [['Size', '900 × 400 × 4 mm'], ['Surface', 'Control cloth'], ['Edges', 'Stitched'], ['Base', 'Non-slip rubber']],
    art: { type: 'mousepad', opts: { size: 'xl' } },
  },
  {
    sku: 'DEMO-MP-002', name: 'Kyrex Speed Medium Mouse Pad', brand: 'Kyrex', category: 'mouse-pads', subcategory: null,
    price: 1499, stock: 45, tags: ['speed', 'medium'],
    shortDescription: 'Medium speed-surface mouse pad for fast swipes.',
    description: desc('A smooth, fast glide for low-sensitivity players.', 'Water-resistant coating.'),
    specs: [['Size', '360 × 300 × 3 mm'], ['Surface', 'Speed cloth']],
    art: { type: 'mousepad', accent: '#f04452' },
  },
  {
    sku: 'DEMO-MP-003', name: 'Nordbyte Mouse Pad with Wrist Rest', brand: 'Nordbyte', category: 'mouse-pads', subcategory: null,
    price: 1999, stock: 20, tags: ['wrist rest', 'ergonomic'],
    shortDescription: 'Mouse pad with a memory-foam wrist rest for comfort.',
    description: desc('Soft memory-foam wrist support to reduce strain.', 'Smooth surface for office and gaming.'),
    specs: [['Size', '300 × 250 mm'], ['Wrist rest', 'Memory foam']],
    art: { type: 'mousepad', accent: '#22c55e', opts: { wrist: true } },
  },

  // ---------- Streaming & audio ----------
  {
    sku: 'DEMO-ST-001', name: 'Vantix Stream USB Microphone', brand: 'Vantix', category: 'streaming-gear', subcategory: null,
    price: 12999, stock: 8, tags: ['usb microphone', 'streaming'],
    shortDescription: 'USB condenser microphone with tap-to-mute and a desk stand.',
    description: desc('A plug-and-play condenser mic for streaming, voice chat and recording.', 'Tap-to-mute sensor and headphone monitoring jack.'),
    specs: [['Connection', 'USB-C'], ['Type', 'Condenser, cardioid'], ['Sample rate', '48 kHz'], ['Extras', 'Tap-to-mute, monitoring jack']],
    art: { type: 'microphone' },
  },
  {
    sku: 'DEMO-ST-002', name: 'Kyrex 1080p 60 fps Streaming Webcam', brand: 'Kyrex', category: 'streaming-gear', subcategory: null,
    price: 9499, salePrice: 8499, stock: 10, tags: ['webcam', '1080p'],
    shortDescription: 'Full HD 60 fps webcam with autofocus and dual microphones.',
    description: desc('Smooth 1080p video at 60 frames per second for streams and calls.', 'Clip mount fits monitors and laptops.'),
    specs: [['Resolution', '1080p at 60 fps'], ['Focus', 'Autofocus'], ['Microphones', 'Dual'], ['Connection', 'USB-A']],
    art: { type: 'webcam', accent: '#06b6d4' },
  },

  // ---------- Setup accessories ----------
  {
    sku: 'DEMO-AC-001', name: 'Strato RGB Headset Stand', brand: 'Strato', category: 'setup-accessories', subcategory: null,
    price: 3999, stock: 15, tags: ['headset stand', 'rgb'],
    shortDescription: 'Headset stand with RGB base and a built-in USB port.',
    description: desc('Keeps your headset off the desk and shows off your setup.', 'RGB base with a pass-through USB port.'),
    specs: [['Lighting', 'RGB'], ['Extras', 'USB pass-through'], ['Base', 'Non-slip']],
    art: { type: 'stand' },
  },
  {
    sku: 'DEMO-AC-002', name: 'Nordbyte Mouse Bungee', brand: 'Nordbyte', category: 'setup-accessories', subcategory: null,
    price: 1799, stock: 25, tags: ['mouse bungee', 'cable management'],
    shortDescription: 'Weighted mouse bungee that removes cable drag for wired mice.',
    description: desc('Holds your mouse cable up so it does not drag on the pad.', 'Weighted, non-slip base.'),
    specs: [['Arm', 'Flexible spring'], ['Base', 'Weighted, non-slip']],
    art: { type: 'bungee', accent: '#22c55e' },
  },
  {
    sku: 'DEMO-AC-003', name: 'Vantix Ambient RGB Light Bars (Pair)', brand: 'Vantix', category: 'setup-accessories', subcategory: null,
    price: 6999, stock: 9, tags: ['rgb', 'lighting', 'ambient'],
    shortDescription: 'Pair of RGB light bars for ambient desk and monitor lighting.',
    description: desc('Add ambient colour behind your monitor or around your desk.', 'Music-sync and preset modes.'),
    specs: [['Quantity', '2 bars'], ['Lighting', 'RGB, music sync'], ['Power', 'USB']],
    art: { type: 'lightbars', accent: '#a855f7' },
  },
];
