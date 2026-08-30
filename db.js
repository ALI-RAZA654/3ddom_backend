const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_PRODUCTS = [
  // 3D PRINTING VERTICAL
  {
    id: 'prod-3d-1',
    slug: 'ender-3-v3-se-3d-printer',
    name: 'Ender 3 V3 SE High-Speed 3D Printer',
    vertical: '3d-printing',
    category: 'Printers',
    brand: 'Creality',
    price: 219.00,
    originalPrice: 249.00,
    stock: 15,
    rating: 4.8,
    reviewCount: 34,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'High-speed auto-leveling FDM printer with dual Z-axis, CR Touch leveling, and Sprite direct extruder.',
    attributes: { speed: '250mm/s', buildVolume: '220x220x250mm', extruder: 'Sprite Direct Drive' },
    isFeatured: true
  },
  {
    id: 'prod-3d-2',
    slug: 'bambu-lab-p1s-combo-3d-printer',
    name: 'Bambu Lab P1S Combo with AMS 3D Printer',
    vertical: '3d-printing',
    category: 'Printers',
    brand: 'Bambu Lab',
    price: 949.00,
    originalPrice: 999.00,
    stock: 8,
    rating: 4.95,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1612815150330-80e90c888d22?auto=format&fit=crop&w=800&q=80',
    description: 'Enclosed multi-color 3D printer capable of 500mm/s acceleration with automatic filament switching system.',
    attributes: { speed: '500mm/s', buildVolume: '256x256x256mm', colors: 'Up to 16 Colors' },
    isFeatured: true
  },
  {
    id: 'prod-3d-3',
    slug: 'voron-2-4-r2-corexy-kit',
    name: 'Voron 2.4 R2 CoreXY DIY 3D Printer Kit',
    vertical: '3d-printing',
    category: 'Printers',
    brand: 'Voron',
    price: 899.00,
    originalPrice: 950.00,
    stock: 4,
    rating: 4.9,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    description: 'Enclosed CoreXY high-performance printer with flying gantry design for ultimate speed and precision.',
    attributes: { speed: '350mm/s', buildVolume: '350x350x350mm', firmware: 'Klipper' },
    isFeatured: false
  },
  {
    id: 'prod-3d-4',
    slug: 'premium-pla-plus-filament-black-1kg',
    name: '3DOM Pro PLA+ Tough Filament 1.75mm (Jet Black 1kg)',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: '3DOM Tech',
    price: 22.99,
    originalPrice: 27.99,
    stock: 45,
    rating: 4.85,
    reviewCount: 120,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-smooth, low-warp PLA+ engineered for high-speed printing with superior layer adhesion.',
    attributes: { material: 'PLA', diameter: '1.75mm', weight: '1kg', temp: '190-220°C' },
    isFeatured: true
  },
  {
    id: 'prod-3d-5',
    slug: 'petg-tough-filament-fire-red-1kg',
    name: '3DOM PETG High Impact Filament (Fire Red 1kg)',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: '3DOM Tech',
    price: 24.50,
    originalPrice: 29.00,
    stock: 30,
    rating: 4.75,
    reviewCount: 64,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    description: 'Durable, weather-resistant PETG filament combining the ease of PLA with the strength of ABS.',
    attributes: { material: 'PETG', diameter: '1.75mm', weight: '1kg', temp: '230-250°C' },
    isFeatured: false
  },
  {
    id: 'prod-3d-6',
    slug: 'high-speed-abs-plus-white-1kg',
    name: 'eSun ABS+ Low Warp Filament (Pure White 1kg)',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: 'eSun',
    price: 26.00,
    originalPrice: 30.00,
    stock: 20,
    rating: 4.65,
    reviewCount: 41,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'Formulated ABS+ with minimal warping and chemical resistance for functional engineering prototypes.',
    attributes: { material: 'ABS', diameter: '1.75mm', weight: '1kg', temp: '240-260°C' },
    isFeatured: false
  },
  {
    id: 'prod-3d-7',
    slug: 'nylon-carbon-fiber-filament-1kg',
    name: 'Polymaker PolyMax Nylon Carbon Fiber (CF) Filament',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: 'Polymaker',
    price: 59.99,
    originalPrice: 69.99,
    stock: 12,
    rating: 4.9,
    reviewCount: 29,
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    description: 'Industrial grade carbon fiber reinforced nylon with high thermal tolerance and tensile strength.',
    attributes: { material: 'Nylon', diameter: '1.75mm', weight: '500g', temp: '280-300°C' },
    isFeatured: true
  },
  {
    id: 'prod-3d-8',
    slug: 'asa-uv-resistant-filament-1kg',
    name: '3DOM Outdoor ASA UV-Resistant Filament (Dark Gray)',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: '3DOM Tech',
    price: 29.90,
    originalPrice: 34.00,
    stock: 18,
    rating: 4.8,
    reviewCount: 22,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    description: 'Weatherproof & UV-stable ASA filament designed for outdoor automotive & structural components.',
    attributes: { material: 'ASA', diameter: '1.75mm', weight: '1kg', temp: '240-260°C' },
    isFeatured: false
  },
  {
    id: 'prod-3d-9',
    slug: 'hardened-steel-nozzle-04mm',
    name: 'E3D V6 Hardened Steel Nozzle (0.4mm / 1.75mm)',
    vertical: '3d-printing',
    category: '3D Printer Parts',
    brand: 'E3D',
    price: 14.99,
    originalPrice: 18.00,
    stock: 100,
    rating: 4.9,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    description: 'Wear-resistant hardened steel nozzle ideal for abrasive filaments like wood, glow-in-the-dark, and carbon fiber.',
    attributes: { partType: 'Nozzle', diameter: '0.4mm', material: 'Hardened Steel' },
    isFeatured: false
  },
  {
    id: 'prod-3d-10',
    slug: 'all-metal-hotend-kit-high-temp',
    name: 'Micro Swiss All Metal Hotend Kit (High Temp 300°C)',
    vertical: '3d-printing',
    category: '3D Printer Parts',
    brand: 'Micro Swiss',
    price: 48.50,
    originalPrice: 55.00,
    stock: 25,
    rating: 4.85,
    reviewCount: 39,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    description: 'Precision CNC machined all-metal heat break upgrade for high temperature industrial materials.',
    attributes: { partType: 'Hotend', maxTemp: '300°C', compatibility: 'Ender 3 / CR-10' },
    isFeatured: false
  },
  {
    id: 'prod-3d-11',
    slug: 'direct-drive-extruder-module',
    name: 'Creality Sprite Direct Drive Dual Gear Extruder',
    vertical: '3d-printing',
    category: '3D Printer Parts',
    brand: 'Creality',
    price: 59.00,
    originalPrice: 69.00,
    stock: 14,
    rating: 4.7,
    reviewCount: 26,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Compact 3.3:1 gear ratio direct drive extruder for flexible TPU and precise filament feeding.',
    attributes: { partType: 'Extruder', gearRatio: '3.3:1', weight: '210g' },
    isFeatured: false
  },
  {
    id: 'prod-3d-12',
    slug: 'magnetic-pei-flexible-build-plate',
    name: '3DOM Dual-Sided Textured PEI Powder Coated Steel Sheet (235x235mm)',
    vertical: '3d-printing',
    category: 'Printer Accessories',
    brand: '3DOM Tech',
    price: 28.00,
    originalPrice: 35.00,
    stock: 40,
    rating: 4.95,
    reviewCount: 95,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    description: 'Spring steel sheet coated with textured PEI for effortless print removal and perfect first layer adhesion.',
    attributes: { partType: 'Build plate', size: '235x235mm', surface: 'Textured PEI' },
    isFeatured: true
  },
  {
    id: 'prod-3d-13',
    slug: 'smart-filament-dryer-box-s2',
    name: 'Sunlu S2 Smart Heated Filament Dryer Box with Humidity Sensor',
    vertical: '3d-printing',
    category: 'Printer Accessories',
    brand: 'Sunlu',
    price: 69.00,
    originalPrice: 79.99,
    stock: 16,
    rating: 4.8,
    reviewCount: 47,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    description: '360° surround heating filament dryer box with touchscreen display to remove moisture from PLA/PETG/Nylon.',
    attributes: { partType: 'Filament dryer', maxTemp: '70°C', display: 'Touchscreen LCD' },
    isFeatured: true
  },
  {
    id: 'prod-3d-14',
    slug: 'silent-cooling-fan-4010-24v',
    name: 'Noctua NF-A4x10 PWM Ultra Silent Cooling Fan 24V',
    vertical: '3d-printing',
    category: '3D Printer Parts',
    brand: 'Noctua',
    price: 15.50,
    originalPrice: 18.00,
    stock: 60,
    rating: 4.9,
    reviewCount: 110,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    description: 'Whisper-quiet premium cooling fan for hotend and electronics enclosure airflow.',
    attributes: { partType: 'Fans', voltage: '24V', noise: '17.9 dBA' },
    isFeatured: false
  },
  {
    id: 'prod-3d-15',
    slug: 'gt2-timing-belt-5m-pulleys-kit',
    name: 'GT2 Reinforced Rubber Timing Belt 5 Meters + 20T Pulleys Set',
    vertical: '3d-printing',
    category: '3D Printer Parts',
    brand: '3DOM Tech',
    price: 12.00,
    originalPrice: 15.00,
    stock: 85,
    rating: 4.75,
    reviewCount: 53,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Fiberglass reinforced 6mm width GT2 belt with aluminum pulleys for zero backlash motion.',
    attributes: { partType: 'Belts & pulleys', length: '5M', pitch: '2mm' },
    isFeatured: false
  },

  // GEN Z / KOREAN FASHION VERTICAL
  {
    id: 'prod-fashion-1',
    slug: 'oversized-streetwear-hoodie-sage',
    name: 'Korean Oversized Heavyweight Hoodie (Sage Green)',
    vertical: 'fashion',
    category: 'Tops',
    brand: 'Seoul Studio',
    price: 48.00,
    originalPrice: 65.00,
    stock: 25,
    rating: 4.9,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    description: '450GSM French terry fleece hoodie with dropped shoulders and relaxed minimalist silhouette.',
    attributes: { fabric: '100% Cotton', fit: 'Oversized', gender: 'Unisex' },
    isFeatured: true
  },
  {
    id: 'prod-fashion-2',
    slug: 'minimalist-boxy-linen-shirt-offwhite',
    name: 'Minimalist Boxy Camp Collar Shirt (Off-White)',
    vertical: 'fashion',
    category: 'Shirts',
    brand: 'Seoul Studio',
    price: 39.00,
    originalPrice: 49.00,
    stock: 18,
    rating: 4.8,
    reviewCount: 28,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    description: 'Breathable linen-cotton blend shirt with Cuban collar and boxy modern cut.',
    attributes: { fabric: 'Linen Blend', fit: 'Boxy Fit', color: 'Off-White' },
    isFeatured: true
  },
  {
    id: 'prod-fashion-3',
    slug: 'korean-cargo-wide-leg-pants-charcoal',
    name: 'GenZ Wide-Leg Multi-Pocket Cargo Pants (Charcoal)',
    vertical: 'fashion',
    category: 'Bottoms',
    brand: 'K-Style',
    price: 54.00,
    originalPrice: 70.00,
    stock: 22,
    rating: 4.85,
    reviewCount: 65,
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    description: 'Adjustable drawstring waist cargo trousers with utilitarian 3D pockets and relaxed drape.',
    attributes: { style: 'Cargo', fit: 'Wide-Leg', closure: 'Elastic Waist' },
    isFeatured: true
  },
  {
    id: 'prod-fashion-4',
    slug: 'graphic-vintage-washed-tee-acid',
    name: 'Vintage Acid Washed Graphic Drop-Shoulder Tee',
    vertical: 'fashion',
    category: 'T-shirts',
    brand: 'Subculture',
    price: 32.00,
    originalPrice: 42.00,
    stock: 35,
    rating: 4.75,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    description: 'Heavyweight 240GSM cotton tee with custom cyber-vintage chest screen print.',
    attributes: { fabric: '240GSM Cotton', wash: 'Acid Wash', fit: 'Drop Shoulder' },
    isFeatured: false
  },
  {
    id: 'prod-fashion-5',
    slug: 'baggy-y2k-denim-jeans-lightwash',
    name: 'Y2K Baggy Skate Denim Jeans (Light Vintage Wash)',
    vertical: 'fashion',
    category: 'Jeans',
    brand: 'Seoul Studio',
    price: 62.00,
    originalPrice: 78.00,
    stock: 15,
    rating: 4.9,
    reviewCount: 37,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic 90s baggy fit rigid denim featuring subtle distressing and custom branded brass hardware.',
    attributes: { fit: 'Baggy Skate', material: '100% Cotton Denim', rise: 'Mid Rise' },
    isFeatured: true
  },
  {
    id: 'prod-fashion-6',
    slug: 'relaxed-fit-pleated-shorts-beige',
    name: 'Korean Pleated Tailored Shorts (Sand Beige)',
    vertical: 'fashion',
    category: 'Shorts',
    brand: 'K-Style',
    price: 36.00,
    originalPrice: 45.00,
    stock: 20,
    rating: 4.7,
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
    description: 'Clean double-pleated bermuda shorts designed for effortless summer layering.',
    attributes: { length: 'Above Knee', fit: 'Pleated Relaxed', style: 'Smart Casual' },
    isFeatured: false
  },
  {
    id: 'prod-fashion-7',
    slug: 'retro-square-digital-watch-silver',
    name: 'Retro Cyber Digital Steel Bracelet Watch (Silver Chrome)',
    vertical: 'fashion',
    category: 'Watches',
    brand: 'Chrono G',
    price: 45.00,
    originalPrice: 60.00,
    stock: 30,
    rating: 4.95,
    reviewCount: 51,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'Iconic 80s square digital watch with LED backlight, stopwatch, and water resistance.',
    attributes: { material: 'Stainless Steel', movement: 'Digital Quartz', waterResist: '30M' },
    isFeatured: true
  },

  // BEAUTY VERTICAL
  {
    id: 'prod-beauty-1',
    slug: 'midnight-musk-eau-de-parfum-100ml',
    name: '3DOM Maison Midnight Musk Eau de Parfum (100ml)',
    vertical: 'beauty',
    category: 'Perfumes',
    brand: 'Maison 3DOM',
    price: 85.00,
    originalPrice: 110.00,
    stock: 14,
    rating: 4.95,
    reviewCount: 73,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'Sensual luxury fragrance featuring top notes of smoked bergamot, heart of black rose, and base of rich amber musk.',
    attributes: { size: '100ml', type: 'Eau de Parfum', notes: 'Bergamot, Rose, Amber' },
    isFeatured: true
  },
  {
    id: 'prod-beauty-2',
    slug: 'velvet-rose-amber-cologne-50ml',
    name: '3DOM Maison Velvet Rose & Warm Amber Perfume Oil (50ml)',
    vertical: 'beauty',
    category: 'Perfumes',
    brand: 'Maison 3DOM',
    price: 68.00,
    originalPrice: 80.00,
    stock: 19,
    rating: 4.85,
    reviewCount: 31,
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    description: 'Long-lasting concentrated perfume oil infused with Damask rose petals and warm cedarwood.',
    attributes: { size: '50ml', type: 'Perfume Oil', longevity: '12 Hours+' },
    isFeatured: false
  },
  {
    id: 'prod-beauty-3',
    slug: 'hydrating-botanical-hair-shampoo-500ml',
    name: 'Botanique Organic Argan & Oat Milk Hydrating Shampoo (500ml)',
    vertical: 'beauty',
    category: 'Shampoo',
    brand: 'Botanique',
    price: 28.00,
    originalPrice: 35.00,
    stock: 40,
    rating: 4.8,
    reviewCount: 59,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    description: 'Sulfate-free scalp soothing formula enriched with cold-pressed Moroccan argan oil.',
    attributes: { size: '500ml', sulfateFree: true, hairType: 'All Hair Types' },
    isFeatured: true
  },
  {
    id: 'prod-beauty-4',
    slug: 'restorative-keratin-repair-mask',
    name: 'Botanique Deep Restorative Keratin & Peptide Hair Mask',
    vertical: 'beauty',
    category: 'Masks',
    brand: 'Botanique',
    price: 34.00,
    originalPrice: 42.00,
    stock: 25,
    rating: 4.9,
    reviewCount: 44,
    image: 'https://images.unsplash.com/photo-1567928269937-ae146e45b428?auto=format&fit=crop&w=800&q=80',
    description: 'Intense 5-minute conditioning treatment that reverses heat damage and restores glossy shine.',
    attributes: { size: '250g', formula: 'Keratin + Peptides', use: 'Weekly Treatment' },
    isFeatured: true
  },
  {
    id: 'prod-beauty-5',
    slug: 'hyaluronic-acid-glow-face-sheet-masks',
    name: 'K-Glow Triple Hyaluronic Acid Hydrating Sheet Masks (Set of 5)',
    vertical: 'beauty',
    category: 'Masks',
    brand: 'K-Glow',
    price: 22.00,
    originalPrice: 28.00,
    stock: 50,
    rating: 4.85,
    reviewCount: 104,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    description: 'Bio-cellulose facial mask drenched in 30ml of plumping hyaluronic acid & niacinamide serum.',
    attributes: { packSize: '5 Sheets', keyIngredient: 'Hyaluronic Acid & Niacinamide' },
    isFeatured: false
  },
  {
    id: 'prod-beauty-6',
    slug: 'tinted-honey-lip-balm-berry-rose',
    name: 'K-Glow Nourishing Honey Lip Treatment Balm (Berry Rose)',
    vertical: 'beauty',
    category: 'Lip Balms',
    brand: 'K-Glow',
    price: 16.00,
    originalPrice: 20.00,
    stock: 60,
    rating: 4.75,
    reviewCount: 82,
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
    description: 'Sheer glossy tinted balm crafted with organic Manuka honey and vitamin E for juicy hydration.',
    attributes: { finish: 'Sheer Gloss', shade: 'Berry Rose', SPF: '15' },
    isFeatured: false
  },
  {
    id: 'prod-beauty-7',
    slug: 'ultra-nourishing-overnight-lip-sleeping-mask',
    name: 'K-Glow Intensive Overnight Berry Lip Mask Jar (20g)',
    vertical: 'beauty',
    category: 'Lip Balms',
    brand: 'K-Glow',
    price: 19.50,
    originalPrice: 24.00,
    stock: 45,
    rating: 4.9,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    description: 'Leave-on lip butter mask that melts away dead skin cells overnight for baby-soft lips.',
    attributes: { size: '20g', scent: 'Wild Berry', use: 'Overnight' },
    isFeatured: true
  }
];

const INITIAL_COUPONS = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 30,
    usageLimit: 1000,
    usedCount: 42,
    isActive: true,
    expiresAt: '2027-12-31'
  },
  {
    code: '3DOM20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 50,
    usageLimit: 500,
    usedCount: 89,
    isActive: true,
    expiresAt: '2027-12-31'
  },
  {
    code: 'FLAT15',
    discountType: 'flat',
    discountValue: 15,
    minOrderValue: 60,
    usageLimit: 200,
    usedCount: 15,
    isActive: true,
    expiresAt: '2027-12-31'
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    productId: 'prod-3d-1',
    customerName: 'Alex Mercer',
    rating: 5,
    comment: 'The Ender 3 V3 SE worked out of the box! Auto-leveling is spot on and CR Touch makes first layers perfect.',
    status: 'approved',
    createdAt: '2026-08-20T10:30:00.000Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-3d-4',
    customerName: 'Sarah K.',
    rating: 5,
    comment: 'Best PLA filament I have used. Zero stringing at 220°C on my Bambu P1S.',
    status: 'approved',
    createdAt: '2026-08-22T14:15:00.000Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-fashion-1',
    customerName: 'Ji-hoon L.',
    rating: 5,
    comment: 'Heavyweight fleece fabric quality is insane! Feels like a $150 designer hoodie.',
    status: 'approved',
    createdAt: '2026-08-24T09:00:00.000Z'
  },
  {
    id: 'rev-4',
    productId: 'prod-beauty-1',
    customerName: 'Evelyn V.',
    rating: 5,
    comment: 'Smells luxurious! I get compliments everywhere I go. Long lasting projection.',
    status: 'approved',
    createdAt: '2026-08-25T18:45:00.000Z'
  }
];

const INITIAL_REQUESTS = [
  {
    id: 'req-101',
    customerEmail: 'david.b@example.com',
    whatsappNumber: '+1 555 019 2831',
    requestedItem: 'Voron Stealthburner Toolhead Kit with Canbus Board',
    requiredDate: '2026-09-10',
    deliveryAddress: '742 Evergreen Terrace, Springfield',
    status: 'pending',
    createdAt: '2026-08-27T11:20:00.000Z'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-98421',
    customer: {
      name: 'Michael Scott',
      email: 'm.scott@example.com',
      phone: '+1 555 382 9102',
      address: '1725 Slough Avenue, Scranton, PA'
    },
    items: [
      {
        id: 'prod-3d-4',
        name: '3DOM Pro PLA+ Tough Filament 1.75mm (Jet Black 1kg)',
        price: 22.99,
        quantity: 2,
        vertical: '3d-printing'
      }
    ],
    totalAmount: 45.98,
    discountAmount: 0,
    finalAmount: 45.98,
    paymentMethod: 'Stripe Test Card',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    carrier: 'Bluedart',
    trackingNumber: 'BD749201938IN',
    createdAt: '2026-08-26T16:00:00.000Z'
  }
];

class Database {
  constructor() {
    this.data = {
      products: INITIAL_PRODUCTS,
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      requests: INITIAL_REQUESTS,
      orders: INITIAL_ORDERS
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading DB, using memory defaults', e);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving DB file', e);
    }
  }
}

module.exports = new Database();
