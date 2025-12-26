const svgToDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

const normalizeText = (value) => (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const hashString = (value) => {
  const str = value || ""
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

const pick = (arr, seed) => arr[seed % arr.length]

const titleBadge = (title) => `
  <g>
    <rect x="18" y="16" rx="14" ry="14" width="220" height="34" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.12)" stroke-width="2" />
    <text x="30" y="39" font-size="14" font-weight="700" fill="#0f172a" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial">
      ${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
    </text>
  </g>
`

const accents = (palette) => `
  <g opacity="0.95">
    <path d="M340 26l6 12 13 2-10 9 2 13-11-6-11 6 2-13-10-9 13-2z" fill="${palette.star}" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <path d="M364 148l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1z" fill="${palette.pop}" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <circle cx="70" cy="160" r="14" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <circle cx="70" cy="160" r="2" fill="#0f172a"/>
    <path d="M70 160L70 152" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
    <path d="M70 160L78 164" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
    <circle cx="320" cy="172" r="6" fill="${palette.dot1}" />
    <circle cx="336" cy="170" r="4" fill="${palette.dot2}" />
    <circle cx="350" cy="178" r="5" fill="${palette.dot3}" />
  </g>
`

const palettes = [
  { bgA: "#a7f3d0", bgB: "#67e8f9", star: "#fbbf24", pop: "#fb7185", dot1: "#22c55e", dot2: "#06b6d4", dot3: "#a855f7" },
  { bgA: "#fde68a", bgB: "#93c5fd", star: "#fb7185", pop: "#fbbf24", dot1: "#0ea5e9", dot2: "#22c55e", dot3: "#a855f7" },
  { bgA: "#f0abfc", bgB: "#60a5fa", star: "#fbbf24", pop: "#22c55e", dot1: "#fb7185", dot2: "#06b6d4", dot3: "#a855f7" },
  { bgA: "#bbf7d0", bgB: "#ddd6fe", star: "#fbbf24", pop: "#0ea5e9", dot1: "#22c55e", dot2: "#fb7185", dot3: "#06b6d4" },
  { bgA: "#fecaca", bgB: "#bfdbfe", star: "#fbbf24", pop: "#a855f7", dot1: "#22c55e", dot2: "#06b6d4", dot3: "#fb7185" },
]

const paletteFor = ({ title, topic }) => pick(palettes, hashString(`${normalizeText(title)}|${normalizeText(topic)}`))

const mathCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(58 86)">
    <rect x="0" y="0" width="88" height="76" rx="16" fill="#0ea5e9" opacity="0.12"/>
    <rect x="6" y="6" width="76" height="16" rx="8" fill="#0ea5e9" opacity="0.25"/>
    <rect x="10" y="28" width="16" height="16" rx="6" fill="#22c55e" opacity="0.85"/>
    <rect x="30" y="28" width="16" height="16" rx="6" fill="#fbbf24" opacity="0.9"/>
    <rect x="50" y="28" width="16" height="16" rx="6" fill="#fb7185" opacity="0.9"/>
    <rect x="10" y="48" width="16" height="16" rx="6" fill="#a855f7" opacity="0.85"/>
    <rect x="30" y="48" width="16" height="16" rx="6" fill="#06b6d4" opacity="0.85"/>
    <rect x="50" y="48" width="16" height="16" rx="6" fill="#0ea5e9" opacity="0.85"/>
    <path d="M72 30h10M72 36h10M72 42h10" stroke="rgba(15,23,42,0.45)" stroke-width="2" stroke-linecap="round"/>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#0f172a">
    <text x="170" y="105" font-size="22" font-weight="800">2 + 2 = 4</text>
    <text x="170" y="133" font-size="16" font-weight="700" opacity="0.85">x² + y²</text>
    <text x="170" y="158" font-size="16" font-weight="700" opacity="0.85">π ≈ 3.14</text>
    <path d="M170 165c18 10 40 10 64 0" stroke="#fb7185" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.8"/>
  </g>

  <g opacity="0.9">
    <path d="M300 95l5 9 10 2-8 7 2 10-9-5-9 5 2-10-8-7 10-2z" fill="#fbbf24" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <path d="M318 136l4 7 8 1-6 6 1 8-7-4-7 4 1-8-6-6 8-1z" fill="#22c55e" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
  </g>
</svg>
`

const gkCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="60%">
      <stop offset="0" stop-color="rgba(250,204,21,0.95)"/>
      <stop offset="1" stop-color="rgba(250,204,21,0)"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(78 84)">
    <circle cx="70" cy="26" r="34" fill="url(#glow)"/>
    <path d="M70 2c18 0 32 14 32 32 0 13-8 24-20 29v9H58v-9C46 58 38 47 38 34 38 16 52 2 70 2z" fill="#fbbf24" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <path d="M54 70h32" stroke="rgba(0,0,0,0.26)" stroke-width="6" stroke-linecap="round"/>
    <path d="M56 78h28" stroke="rgba(0,0,0,0.26)" stroke-width="6" stroke-linecap="round"/>
    <path d="M60 86h20" stroke="rgba(0,0,0,0.26)" stroke-width="6" stroke-linecap="round"/>
    <path d="M70 -10v10M40 10l8 6M100 10l-8 6M34 36h10M96 36h10" stroke="rgba(15,23,42,0.55)" stroke-width="2" stroke-linecap="round"/>
  </g>

  <g transform="translate(214 96)">
    <circle cx="64" cy="38" r="34" fill="#22c55e" opacity="0.18"/>
    <circle cx="64" cy="38" r="28" fill="#06b6d4" opacity="0.22"/>
    <circle cx="64" cy="38" r="24" fill="#0ea5e9" opacity="0.18"/>
    <circle cx="64" cy="38" r="22" fill="#38bdf8" opacity="0.25" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <path d="M42 38h44M64 16v44M46 24c10 8 26 8 36 0M46 52c10-8 26-8 36 0" stroke="rgba(15,23,42,0.35)" stroke-width="2" stroke-linecap="round"/>
    <path d="M64 16c6 8 6 52 0 60M64 16c-6 8-6 52 0 60" stroke="rgba(15,23,42,0.22)" stroke-width="2" stroke-linecap="round"/>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#0f172a" opacity="0.9">
    <text x="170" y="156" font-size="14" font-weight="700">Think • Learn • Explore</text>
  </g>
</svg>
`

const movieCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(62 86)">
    <path d="M20 18h74l-10 66H30z" fill="#fb7185" opacity="0.18"/>
    <path d="M24 18h66l-8 66H32z" fill="#fb7185" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <path d="M24 18h66" stroke="#ffffff" stroke-width="6" opacity="0.9"/>
    <path d="M28 26h58" stroke="#ffffff" stroke-width="4" opacity="0.9"/>
    <circle cx="32" cy="12" r="8" fill="#fbbf24" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <circle cx="48" cy="10" r="7" fill="#fbbf24" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <circle cx="64" cy="12" r="8" fill="#fbbf24" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <circle cx="80" cy="10" r="7" fill="#fbbf24" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(206 86)">
    <circle cx="64" cy="38" r="30" fill="#0ea5e9" opacity="0.18"/>
    <circle cx="64" cy="38" r="26" fill="#0ea5e9" opacity="0.12" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <circle cx="64" cy="38" r="4" fill="#0f172a" opacity="0.6"/>
    <circle cx="64" cy="12" r="4" fill="#0f172a" opacity="0.45"/>
    <circle cx="88" cy="24" r="4" fill="#0f172a" opacity="0.45"/>
    <circle cx="88" cy="52" r="4" fill="#0f172a" opacity="0.45"/>
    <circle cx="64" cy="64" r="4" fill="#0f172a" opacity="0.45"/>
    <circle cx="40" cy="52" r="4" fill="#0f172a" opacity="0.45"/>
    <circle cx="40" cy="24" r="4" fill="#0f172a" opacity="0.45"/>
    <path d="M64 12v52M40 24l48 28M40 52l48-28" stroke="rgba(15,23,42,0.35)" stroke-width="2"/>
  </g>

  <g opacity="0.95">
    <path d="M330 96l6 12 13 2-10 9 2 13-11-6-11 6 2-13-10-9 13-2z" fill="#fbbf24" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <path d="M312 124l5 9 10 1-8 7 2 10-9-5-9 5 2-10-8-7 10-1z" fill="#fbbf24" opacity="0.85" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <path d="M346 124l5 9 10 1-8 7 2 10-9-5-9 5 2-10-8-7 10-1z" fill="#fbbf24" opacity="0.85" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
  </g>
</svg>
`

const historyCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(64 86)">
    <path d="M24 12h92v76H24z" fill="#ffffff" stroke="rgba(0,0,0,0.16)" stroke-width="2" rx="12"/>
    <path d="M34 22h72M34 36h62M34 50h66M34 64h56" stroke="rgba(15,23,42,0.28)" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 20c8 6 14 6 22 0v64c-8 6-14 6-22 0z" fill="${palette.pop}" opacity="0.22"/>
    <path d="M116 20c-8 6-14 6-22 0v64c8 6 14 6 22 0z" fill="${palette.dot2}" opacity="0.18"/>
    <path d="M72 86c-10 0-18 8-18 18 0 6 3 12 8 15v7h20v-7c5-3 8-9 8-15 0-10-8-18-18-18z" fill="${palette.star}" opacity="0.9" stroke="rgba(0,0,0,0.14)" stroke-width="2"/>
    <path d="M62 124h20" stroke="rgba(0,0,0,0.26)" stroke-width="6" stroke-linecap="round"/>
  </g>

  <g transform="translate(208 84)">
    <path d="M16 12h128" stroke="rgba(15,23,42,0.22)" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 58h128" stroke="rgba(15,23,42,0.22)" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 104h128" stroke="rgba(15,23,42,0.22)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="22" cy="12" r="8" fill="${palette.dot1}" opacity="0.9"/>
    <circle cx="50" cy="58" r="8" fill="${palette.dot2}" opacity="0.9"/>
    <circle cx="90" cy="104" r="8" fill="${palette.dot3}" opacity="0.9"/>
    <path d="M22 12L50 58L90 104" stroke="rgba(15,23,42,0.28)" stroke-width="3" stroke-linecap="round"/>
    <path d="M104 34l6 12 13 2-10 9 2 13-11-6-11 6 2-13-10-9 13-2z" fill="${palette.star}" opacity="0.9" stroke="rgba(0,0,0,0.14)" stroke-width="2"/>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#0f172a" opacity="0.85">
    <text x="150" y="122" font-size="20" font-weight="800">Timeline Quest</text>
    <text x="150" y="150" font-size="14" font-weight="700">Past • People • Places</text>
  </g>
</svg>
`

const scienceCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(64 84)">
    <path d="M40 8h48v12l-10 18v40c0 10-8 18-18 18s-18-8-18-18V38L32 20V8z" fill="#ffffff" stroke="rgba(0,0,0,0.16)" stroke-width="2" />
    <path d="M38 38h44" stroke="rgba(15,23,42,0.22)" stroke-width="6" stroke-linecap="round"/>
    <path d="M42 54h36" stroke="rgba(15,23,42,0.22)" stroke-width="6" stroke-linecap="round"/>
    <path d="M46 70h28" stroke="rgba(15,23,42,0.22)" stroke-width="6" stroke-linecap="round"/>
    <path d="M40 78c0 8 8 14 20 14s20-6 20-14c0-8-8-14-20-14s-20 6-20 14z" fill="${palette.dot2}" opacity="0.22"/>
    <circle cx="56" cy="80" r="5" fill="${palette.star}" opacity="0.95"/>
    <circle cx="70" cy="72" r="4" fill="${palette.pop}" opacity="0.95"/>
    <circle cx="78" cy="86" r="4" fill="${palette.dot3}" opacity="0.95"/>
  </g>

  <g transform="translate(210 88)">
    <circle cx="28" cy="28" r="18" fill="${palette.dot1}" opacity="0.18"/>
    <circle cx="84" cy="22" r="14" fill="${palette.dot2}" opacity="0.18"/>
    <circle cx="62" cy="64" r="20" fill="${palette.dot3}" opacity="0.16"/>
    <path d="M28 28L84 22L62 64z" stroke="rgba(15,23,42,0.26)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="28" cy="28" r="4" fill="#0f172a" opacity="0.55"/>
    <circle cx="84" cy="22" r="4" fill="#0f172a" opacity="0.55"/>
    <circle cx="62" cy="64" r="4" fill="#0f172a" opacity="0.55"/>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#0f172a" opacity="0.85">
    <text x="150" y="122" font-size="20" font-weight="800">Lab Sparks</text>
    <text x="150" y="150" font-size="14" font-weight="700">Atoms • Experiments • Wow</text>
  </g>
</svg>
`

const geographyCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(66 84)">
    <circle cx="64" cy="48" r="38" fill="#38bdf8" opacity="0.22"/>
    <circle cx="64" cy="48" r="34" fill="#22c55e" opacity="0.18"/>
    <circle cx="64" cy="48" r="32" fill="#38bdf8" opacity="0.25" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <path d="M40 48h48M64 24v48M44 32c12 10 28 10 40 0M44 64c12-10 28-10 40 0" stroke="rgba(15,23,42,0.34)" stroke-width="2" stroke-linecap="round"/>
    <path d="M64 16c8 10 8 60 0 72M64 16c-8 10-8 60 0 72" stroke="rgba(15,23,42,0.22)" stroke-width="2" stroke-linecap="round"/>
    <path d="M114 22l18 10-18 10-18-10z" fill="${palette.star}" opacity="0.95" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <circle cx="114" cy="32" r="4" fill="#0f172a" opacity="0.6"/>
  </g>

  <g transform="translate(214 92)">
    <path d="M14 24c18-18 64-18 82 0 18 18-12 52-41 76C26 76-4 42 14 24z" fill="${palette.pop}" opacity="0.22"/>
    <path d="M32 44c10-10 36-10 46 0 10 10-8 30-23 44C40 74 22 54 32 44z" fill="#ffffff" stroke="rgba(0,0,0,0.14)" stroke-width="2"/>
    <path d="M46 58h18" stroke="rgba(15,23,42,0.28)" stroke-width="4" stroke-linecap="round"/>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#0f172a" opacity="0.85">
    <text x="150" y="122" font-size="20" font-weight="800">Map Mission</text>
    <text x="150" y="150" font-size="14" font-weight="700">Countries • Capitals • Fun</text>
  </g>
</svg>
`

const literatureCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(64 86)">
    <path d="M22 16c0-8 6-14 14-14h62c8 0 14 6 14 14v76c0 8-6 14-14 14H36c-8 0-14-6-14-14V16z" fill="#ffffff" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <path d="M44 10h46" stroke="${palette.dot3}" stroke-width="8" stroke-linecap="round" opacity="0.35"/>
    <path d="M36 26h62M36 40h54M36 54h58M36 68h50" stroke="rgba(15,23,42,0.26)" stroke-width="3" stroke-linecap="round"/>
    <path d="M98 6l18 12-18 12-18-12z" fill="${palette.star}" opacity="0.95" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(214 86)">
    <path d="M34 78c10-20 44-20 54 0" stroke="${palette.pop}" stroke-width="8" stroke-linecap="round" opacity="0.35"/>
    <path d="M44 62c6-10 28-10 34 0" stroke="${palette.dot2}" stroke-width="8" stroke-linecap="round" opacity="0.35"/>
    <path d="M22 12h96v76H22z" fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.12)" stroke-width="2" rx="14"/>
    <text x="40" y="56" font-size="22" font-weight="900" fill="#0f172a" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" opacity="0.8">Aa</text>
    <text x="74" y="56" font-size="18" font-weight="900" fill="#0f172a" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" opacity="0.55">…</text>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#0f172a" opacity="0.85">
    <text x="150" y="122" font-size="20" font-weight="800">Story Hunt</text>
    <text x="150" y="150" font-size="14" font-weight="700">Books • Quotes • Classics</text>
  </g>
</svg>
`

const techCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(66 88)">
    <rect x="18" y="10" width="92" height="92" rx="18" fill="rgba(14,165,233,0.10)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <rect x="34" y="26" width="60" height="60" rx="12" fill="#ffffff" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <path d="M34 46h60M34 66h60" stroke="rgba(15,23,42,0.22)" stroke-width="4" stroke-linecap="round"/>
    <path d="M64 10v-10M80 10v-10M48 10v-10M64 102v12M80 102v12M48 102v12M18 56H6M18 40H6M18 72H6M110 56h12M110 40h12M110 72h12" stroke="${palette.dot2}" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
  </g>

  <g transform="translate(214 92)">
    <path d="M22 22h106v66H22z" fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.12)" stroke-width="2" rx="14"/>
    <path d="M38 44h40M38 58h56M38 72h46" stroke="rgba(15,23,42,0.26)" stroke-width="3" stroke-linecap="round"/>
    <path d="M104 42l10 10-10 10" fill="none" stroke="${palette.pop}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M92 62l-10 10 10 10" fill="none" stroke="${palette.star}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#0f172a" opacity="0.85">
    <text x="150" y="122" font-size="20" font-weight="800">Tech Trails</text>
    <text x="150" y="150" font-size="14" font-weight="700">Gadgets • Code • Future</text>
  </g>
</svg>
`

const genericCoverSvg = ({ title, palette }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="400" height="200" rx="22" fill="url(#bg)"/>
  ${accents(palette)}
  ${titleBadge(title)}

  <g filter="url(#shadow)">
    <rect x="34" y="58" width="332" height="122" rx="20" fill="url(#card)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
  </g>

  <g transform="translate(70 92)">
    <circle cx="46" cy="42" r="40" fill="${palette.dot1}" opacity="0.14"/>
    <circle cx="46" cy="42" r="32" fill="${palette.dot2}" opacity="0.14"/>
    <circle cx="46" cy="42" r="24" fill="${palette.dot3}" opacity="0.14"/>
    <path d="M30 34c4-12 28-12 32 0 2 6-1 12-6 16l2 10H34l2-10c-5-4-8-10-6-16z" fill="#ffffff" stroke="rgba(0,0,0,0.16)" stroke-width="2"/>
    <text x="38" y="52" font-size="18" font-weight="900" fill="#0f172a" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial">?</text>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#0f172a" opacity="0.85">
    <text x="150" y="115" font-size="20" font-weight="800">Quiz Time</text>
    <text x="150" y="145" font-size="14" font-weight="700">Stars • Clocks • Fun</text>
  </g>
</svg>
`

export const getQuizIllustrationDataUrl = ({ title, topic }) => {
  const t = normalizeText(title)
  const tp = normalizeText(topic)
  const key = `${t} ${tp}`.trim()
  const palette = paletteFor({ title, topic })

  if (key.includes("math") || key.includes("maths") || key.includes("algebra") || key.includes("equation")) {
    return svgToDataUrl(mathCoverSvg({ title: title || "Math Quiz", palette }))
  }
  if (key.includes("general knowledge") || key.includes("gk") || key.includes("knowledge") || key.includes("trivia")) {
    return svgToDataUrl(gkCoverSvg({ title: title || "General Knowledge", palette }))
  }
  if (key.includes("movie") || key.includes("film") || key.includes("cinema")) {
    return svgToDataUrl(movieCoverSvg({ title: title || "Movie Trivia", palette }))
  }
  if (key.includes("history") || key.includes("ancient") || key.includes("war") || key.includes("civilization")) {
    return svgToDataUrl(historyCoverSvg({ title: title || "History", palette }))
  }
  if (key.includes("science") || key.includes("physics") || key.includes("chemistry") || key.includes("biology")) {
    return svgToDataUrl(scienceCoverSvg({ title: title || "Science", palette }))
  }
  if (key.includes("geography") || key.includes("globe") || key.includes("capital") || key.includes("country")) {
    return svgToDataUrl(geographyCoverSvg({ title: title || "Geography", palette }))
  }
  if (key.includes("literature") || key.includes("book") || key.includes("poem") || key.includes("novel")) {
    return svgToDataUrl(literatureCoverSvg({ title: title || "Literature", palette }))
  }
  if (
    key.includes("technology") ||
    key.includes("tech") ||
    key.includes("computer") ||
    key.includes("coding") ||
    key.includes("programming")
  ) {
    return svgToDataUrl(techCoverSvg({ title: title || "Technology", palette }))
  }

  return svgToDataUrl(genericCoverSvg({ title: title || "Quiz", palette }))
}

export const getQuizCoverSrc = (quiz) => {
  if (quiz?.imageUrl) return quiz.imageUrl
  return getQuizIllustrationDataUrl({ title: quiz?.title, topic: quiz?.topic })
}
