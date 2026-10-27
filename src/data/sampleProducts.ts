// Sample product images encoded as crisp high-detail SVG/Data URIs for instant testing

export interface SampleProduct {
  id: string;
  name: string;
  category: string;
  tagline: string;
  suggestedPrompt: string;
  url: string;
}

// Generate realistic product mockup data URLs
function createSampleSvgUrl(type: 'watch' | 'sneaker' | 'cosmetic' | 'headphones'): string {
  if (type === 'watch') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <radialGradient id="deskBg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#e4e0d7" />
          <stop offset="100%" stop-color="#b8b2a5" />
        </radialGradient>
        <linearGradient id="metalBezel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="25%" stop-color="#94a3b8"/>
          <stop offset="50%" stop-color="#cbd5e1"/>
          <stop offset="75%" stop-color="#64748b"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <radialGradient id="dial" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="70%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </radialGradient>
        <linearGradient id="goldAcc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#a16207"/>
        </linearGradient>
        <linearGradient id="strap" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b2219"/>
          <stop offset="20%" stop-color="#543324"/>
          <stop offset="50%" stop-color="#704430"/>
          <stop offset="80%" stop-color="#543324"/>
          <stop offset="100%" stop-color="#3b2219"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="15" flood-color="#4a3e35" flood-opacity="0.35"/>
        </filter>
      </defs>

      <!-- Cluttered Desk Background to demonstrate clean removal -->
      <rect width="800" height="800" fill="url(#deskBg)"/>
      <!-- Background subtle wood grain / desk textures -->
      <path d="M0,150 Q400,160 800,140" stroke="#a39b8c" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M0,320 Q350,300 800,340" stroke="#a39b8c" stroke-width="3" fill="none" opacity="0.3"/>
      <path d="M0,580 Q450,600 800,560" stroke="#a39b8c" stroke-width="2" fill="none" opacity="0.4"/>
      <!-- Coffee mug ring on desk to simulate messy photo -->
      <circle cx="200" cy="220" r="85" fill="none" stroke="#968574" stroke-width="6" opacity="0.35"/>
      <circle cx="205" cy="222" r="80" fill="none" stroke="#7d6a57" stroke-width="3" opacity="0.25"/>

      <!-- PRODUCT: Luxury Chronograph Watch -->
      <g filter="url(#shadow)">
        <!-- Top Strap -->
        <path d="M340,120 L460,120 L450,280 L350,280 Z" fill="url(#strap)"/>
        <!-- Bottom Strap -->
        <path d="M350,520 L450,520 L460,680 L340,680 Z" fill="url(#strap)"/>
        <!-- Stitching -->
        <path d="M346,125 L354,275 M454,125 L446,275 M354,525 L346,675 M446,525 L454,675" stroke="#a16207" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>

        <!-- Crown & Pushers -->
        <rect x="548" y="385" width="22" height="30" rx="3" fill="url(#metalBezel)"/>
        <rect x="540" y="340" width="16" height="22" rx="2" fill="url(#metalBezel)"/>
        <rect x="540" y="438" width="16" height="22" rx="2" fill="url(#metalBezel)"/>

        <!-- Watch Case & Bezel -->
        <circle cx="400" cy="400" r="150" fill="url(#metalBezel)"/>
        <circle cx="400" cy="400" r="140" fill="#0f172a"/>
        <circle cx="400" cy="400" r="134" fill="url(#metalBezel)"/>
        <!-- Dial -->
        <circle cx="400" cy="400" r="126" fill="url(#dial)"/>

        <!-- Hour Markers -->
        <g stroke="url(#goldAcc)" stroke-width="4" stroke-linecap="round">
          <line x1="400" y1="284" x2="400" y2="300" stroke-width="6"/>
          <line x1="400" y1="516" x2="400" y2="500" stroke-width="6"/>
          <line x1="284" y1="400" x2="300" y2="400" stroke-width="6"/>
          <line x1="516" y1="400" x2="500" y2="400" stroke-width="6"/>
          <!-- Subdials -->
          <circle cx="355" cy="400" r="26" fill="none" stroke="#475569" stroke-width="2"/>
          <circle cx="445" cy="400" r="26" fill="none" stroke="#475569" stroke-width="2"/>
          <circle cx="400" cy="445" r="26" fill="none" stroke="#475569" stroke-width="2"/>
        </g>

        <!-- Brand Text -->
        <text x="400" y="346" font-family="sans-serif" font-weight="700" font-size="13" fill="#cbd5e1" text-anchor="middle" letter-spacing="3">CHRONOMASTER</text>
        <text x="400" y="360" font-family="sans-serif" font-weight="500" font-size="8" fill="#eab308" text-anchor="middle" letter-spacing="2">AUTOMATIC</text>

        <!-- Watch Hands -->
        <polygon points="396,400 400,320 404,400" fill="url(#goldAcc)"/>
        <polygon points="396,400 460,370 404,404" fill="url(#goldAcc)"/>
        <line x1="400" y1="430" x2="400" y2="305" stroke="#ef4444" stroke-width="2"/>
        <circle cx="400" cy="400" r="6" fill="#f8fafc"/>

        <!-- Glass Reflection Glare (for clean up demonstration) -->
        <path d="M310,320 Q410,310 470,360 Q390,360 310,320 Z" fill="#ffffff" opacity="0.32"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (type === 'sneaker') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <!-- Busy pavement / sidewalk background -->
        <linearGradient id="pavement" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#9ca3af"/>
          <stop offset="50%" stop-color="#6b7280"/>
          <stop offset="100%" stop-color="#4b5563"/>
        </linearGradient>
        <linearGradient id="sneakerUpper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="40%" stop-color="#0369a1"/>
          <stop offset="100%" stop-color="#075985"/>
        </linearGradient>
        <linearGradient id="sneakerSole" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <filter id="sneakerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="25" stdDeviation="16" flood-color="#1f2937" flood-opacity="0.5"/>
        </filter>
      </defs>

      <!-- Background: Urban concrete floor -->
      <rect width="800" height="800" fill="url(#pavement)"/>
      <line x1="50" y1="200" x2="750" y2="280" stroke="#374151" stroke-width="4" opacity="0.35"/>
      <line x1="80" y1="620" x2="720" y2="580" stroke="#374151" stroke-width="4" opacity="0.35"/>
      <circle cx="680" cy="220" r="40" fill="#374151" opacity="0.2"/>

      <!-- PRODUCT: Modern Streetwear Runner Sneaker -->
      <g filter="url(#sneakerShadow)">
        <!-- Chunky Midsole / Outsole -->
        <path d="M160,530 C190,535 280,538 380,540 C480,542 600,538 650,510 C660,504 670,490 660,475 C640,465 590,470 510,480 C410,492 310,486 210,475 C180,472 150,485 145,505 C142,518 150,528 160,530 Z" fill="url(#sneakerSole)"/>
        <!-- Outsole Grip Accents -->
        <path d="M190,535 L210,515 M250,537 L270,518 M330,539 L350,520 M420,540 L440,522 M520,535 L540,515" stroke="#f97316" stroke-width="4" stroke-linecap="round"/>

        <!-- Main Body Upper -->
        <path d="M180,480 C210,475 280,420 340,360 C380,320 440,300 480,305 C505,308 520,335 520,365 C520,390 500,420 540,440 C580,460 630,460 645,470 C630,475 580,480 500,485 C420,490 300,485 180,480 Z" fill="url(#sneakerUpper)"/>

        <!-- Contrast Overlay Panels -->
        <path d="M340,360 C390,400 450,430 520,440 L530,465 C450,455 380,420 320,380 Z" fill="#f97316"/>
        <path d="M220,476 C260,440 310,430 350,445 C300,465 250,475 220,476 Z" fill="#ffffff" opacity="0.9"/>

        <!-- Collar & Tongue -->
        <path d="M440,300 C460,260 490,265 510,310 C490,305 460,300 440,300 Z" fill="#0f172a"/>
        <!-- Lacing System -->
        <line x1="370" y1="350" x2="410" y2="340" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
        <line x1="390" y1="375" x2="430" y2="365" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
        <line x1="410" y1="400" x2="450" y2="390" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>

        <!-- Brand Icon / Swoop -->
        <path d="M290,440 Q400,410 460,370 Q380,460 290,440 Z" fill="#38bdf8"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (type === 'cosmetic') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <!-- Messy bathroom tile backdrop -->
        <linearGradient id="tileBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </linearGradient>
        <linearGradient id="amberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#78350f" />
          <stop offset="25%" stop-color="#b45309" />
          <stop offset="60%" stop-color="#d97706" />
          <stop offset="85%" stop-color="#92400e" />
          <stop offset="100%" stop-color="#451a03" />
        </linearGradient>
        <linearGradient id="goldDropper" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ca8a04"/>
          <stop offset="50%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#a16207"/>
        </linearGradient>
        <filter id="bottleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="22" stdDeviation="14" flood-color="#451a03" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- Background: Bathroom tiles with water splash spots -->
      <rect width="800" height="800" fill="url(#tileBg)"/>
      <line x1="0" y1="260" x2="800" y2="260" stroke="#94a3b8" stroke-width="3"/>
      <line x1="0" y1="540" x2="800" y2="540" stroke="#94a3b8" stroke-width="3"/>
      <line x1="280" y1="0" x2="280" y2="800" stroke="#94a3b8" stroke-width="3"/>
      <line x1="560" y1="0" x2="560" y2="800" stroke="#94a3b8" stroke-width="3"/>
      <!-- Water droplet blemishes to be cleaned -->
      <circle cx="220" cy="420" r="16" fill="#94a3b8" opacity="0.35"/>
      <circle cx="590" cy="380" r="22" fill="#94a3b8" opacity="0.4"/>

      <!-- PRODUCT: Luxury Amber Glass Facial Serum Bottle -->
      <g filter="url(#bottleShadow)">
        <!-- Rubber Bulb -->
        <path d="M375,170 C375,140 425,140 425,170 Z" fill="#0f172a"/>
        <!-- Gold Dropper Cap Rim -->
        <rect x="365" y="170" width="70" height="36" rx="4" fill="url(#goldDropper)"/>
        <!-- Screw Neck -->
        <rect x="372" y="206" width="56" height="20" fill="url(#amberGlass)"/>

        <!-- Glass Bottle Shoulder & Body -->
        <path d="M372,226 C330,240 320,280 320,330 L320,600 C320,625 340,640 370,640 L430,640 C460,640 480,625 480,600 L480,330 C480,280 470,240 428,226 Z" fill="url(#amberGlass)"/>

        <!-- Minimalist Cream Product Label -->
        <rect x="338" y="340" width="124" height="220" rx="3" fill="#fdfbf7"/>
        <text x="400" y="380" font-family="serif" font-size="14" font-weight="700" fill="#1c1917" text-anchor="middle" letter-spacing="3">L'ÉLIXIR</text>
        <text x="400" y="398" font-family="sans-serif" font-size="7" font-weight="600" fill="#78716c" text-anchor="middle" letter-spacing="2">BOTANICAL SERUM</text>
        <line x1="365" y1="412" x2="435" y2="412" stroke="#d6d3d1" stroke-width="1"/>
        <text x="400" y="440" font-family="sans-serif" font-size="8" fill="#44403c" text-anchor="middle">Pure Bakuchiol &amp; Niacinamide</text>
        <text x="400" y="458" font-family="sans-serif" font-size="7" fill="#78716c" text-anchor="middle">Formulated in France</text>
        <text x="400" y="525" font-family="sans-serif" font-size="7" font-weight="600" fill="#1c1917" text-anchor="middle" letter-spacing="1">30 ML / 1.0 FL OZ</text>

        <!-- Glass Specular Reflection Highlight -->
        <path d="M330,290 L330,610 Q335,610 338,600 L338,290 Z" fill="#ffffff" opacity="0.45"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Headphones default
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <!-- Messy office background -->
      <linearGradient id="officeBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d6d3d1"/>
        <stop offset="100%" stop-color="#a8a29e"/>
      </linearGradient>
      <linearGradient id="silverHeadphones" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="50%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
      <filter id="headphoneShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="24" stdDeviation="18" flood-color="#1c1917" flood-opacity="0.4"/>
      </filter>
    </defs>

    <rect width="800" height="800" fill="url(#officeBg)"/>
    <rect x="80" y="120" width="220" height="280" rx="10" fill="#78716c" opacity="0.25"/>
    <circle cx="680" cy="560" r="90" fill="#78716c" opacity="0.3"/>

    <!-- PRODUCT: Studio Over-Ear ANC Headphones -->
    <g filter="url(#headphoneShadow)">
      <!-- Headband Arch -->
      <path d="M260,420 C260,200 540,200 540,420" fill="none" stroke="url(#silverHeadphones)" stroke-width="32" stroke-linecap="round"/>
      <!-- Padded Cushion -->
      <path d="M300,320 C340,240 460,240 500,320" fill="none" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>

      <!-- Left Ear Cup Assembly -->
      <g transform="translate(210, 420)">
        <ellipse cx="40" cy="50" rx="38" ry="60" fill="#0f172a"/>
        <ellipse cx="40" cy="50" rx="28" ry="50" fill="url(#silverHeadphones)"/>
        <circle cx="40" cy="50" r="16" fill="#334155"/>
      </g>

      <!-- Right Ear Cup Assembly -->
      <g transform="translate(510, 420)">
        <ellipse cx="40" cy="50" rx="38" ry="60" fill="#0f172a"/>
        <ellipse cx="40" cy="50" rx="28" ry="50" fill="url(#silverHeadphones)"/>
        <circle cx="40" cy="50" r="16" fill="#334155"/>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sample-watch',
    name: 'Luxury Chronograph Watch',
    category: 'Jewelry & Watches',
    tagline: 'Messy wood desk background & glass glare',
    suggestedPrompt: 'Remove the messy wood background, eliminate glass glare, and place on a luxury dark slate podium with soft contact shadow.',
    url: createSampleSvgUrl('watch'),
  },
  {
    id: 'sample-cosmetic',
    name: 'L’Élixir Botanical Face Serum',
    category: 'Beauty & Skincare',
    tagline: 'Bathroom tile backdrop with water splashes',
    suggestedPrompt: 'Cut out the serum bottle, clean all water spots, and place on an aesthetic warm sand studio background with gentle floor reflection.',
    url: createSampleSvgUrl('cosmetic'),
  },
  {
    id: 'sample-sneaker',
    name: 'AeroPulse Street Runner',
    category: 'Footwear & Apparel',
    tagline: 'Asphalt sidewalk background & dirt',
    suggestedPrompt: 'Remove the sidewalk background and create a pure white Amazon-compliant e-commerce shot with a crisp 3D drop shadow.',
    url: createSampleSvgUrl('sneaker'),
  },
  {
    id: 'sample-headphones',
    name: 'SonicPro Studio Wireless',
    category: 'Consumer Electronics',
    tagline: 'Cluttered office desk setting',
    suggestedPrompt: 'Isolate the headphones into a transparent PNG cutout with smooth anti-aliased edges and boosted contrast.',
    url: createSampleSvgUrl('headphones'),
  },
];
