/* Inline SVG pictograms — soft 2D line+fill style, theme-tinted via currentColor */
window.CMD_ICONS = {
  star: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M24 6.5 28.6 18l12.4 1-9.5 8 2.9 12.2L24 32.8 13.6 39.2 16.5 27 7 19l12.4-1Z" fill="currentColor" fill-opacity=".18"/>
    <circle cx="24" cy="24" r="2.6" fill="currentColor"/>
  </svg>`,
  heart: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 39.5s-13.5-7.6-13.5-17.6c0-4.7 3.5-8.4 8.1-8.4 3 0 5.4 1.6 5.4 1.6s2.4-1.6 5.4-1.6c4.6 0 8.1 3.7 8.1 8.4C37.5 31.9 24 39.5 24 39.5Z" fill="currentColor" fill-opacity=".18"/>
  </svg>`,
  coin: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="24" cy="24" rx="13" ry="13" fill="currentColor" fill-opacity=".15"/>
    <path d="M24 14v20M19.5 18.5h6a3 3 0 0 1 0 6h-3a3 3 0 0 0 0 6h6"/>
  </svg>`,
  dice: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <rect x="9" y="9" width="30" height="30" rx="6" fill="currentColor" fill-opacity=".15"/>
    <circle cx="17" cy="17" r="2.2" fill="currentColor"/>
    <circle cx="31" cy="17" r="2.2" fill="currentColor"/>
    <circle cx="24" cy="24" r="2.2" fill="currentColor"/>
    <circle cx="17" cy="31" r="2.2" fill="currentColor"/>
    <circle cx="31" cy="31" r="2.2" fill="currentColor"/>
  </svg>`,
  music: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M19 32V14l16-3v18" />
    <ellipse cx="15.5" cy="32" rx="4.5" ry="3.8" fill="currentColor" fill-opacity=".25"/>
    <ellipse cx="31.5" cy="29" rx="4.5" ry="3.8" fill="currentColor" fill-opacity=".25"/>
  </svg>`,
  sparkle: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 8c0 8.8 4.2 13 13 13-8.8 0-13 4.2-13 13 0-8.8-4.2-13-13-13 8.8 0 13-4.2 13-13Z" fill="currentColor" fill-opacity=".18"/>
    <path d="M37 8.5v5M34.5 11h5M9 33.5v4M7 35.5h4"/>
  </svg>`,
  crown: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M8 36V18l7 6 9-12 9 12 7-6v18Z" fill="currentColor" fill-opacity=".18"/>
    <path d="M11 39h26"/>
    <circle cx="24" cy="14" r="2" fill="currentColor"/>
  </svg>`,
  controller: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 18h20a8 8 0 0 1 8 8c0 4-2 8-6 8-3 0-4-3-7-3h-10c-3 0-4 3-7 3-4 0-6-4-6-8a8 8 0 0 1 8-8Z" fill="currentColor" fill-opacity=".15"/>
    <circle cx="18" cy="26" r="1.6" fill="currentColor"/>
    <circle cx="22" cy="26" r="1.6" fill="currentColor"/>
    <circle cx="20" cy="24" r="1.6" fill="currentColor"/>
    <circle cx="20" cy="28" r="1.6" fill="currentColor"/>
    <circle cx="30" cy="25" r="1.8" fill="currentColor"/>
    <circle cx="33.5" cy="28" r="1.8" fill="currentColor"/>
  </svg>`,
  chat: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M9 14a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H21l-8 7v-7h0a4 4 0 0 1-4-4Z" fill="currentColor" fill-opacity=".18"/>
    <circle cx="18" cy="21" r="1.6" fill="currentColor"/>
    <circle cx="24" cy="21" r="1.6" fill="currentColor"/>
    <circle cx="30" cy="21" r="1.6" fill="currentColor"/>
  </svg>`,
  gift: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <rect x="9" y="18" width="30" height="22" rx="3" fill="currentColor" fill-opacity=".15"/>
    <path d="M9 24h30M24 18v22"/>
    <path d="M24 18s-7-1-7-5 5-3 7 1c2-4 7-5 7-1s-7 5-7 5Z" fill="currentColor" fill-opacity=".25"/>
  </svg>`,
  clock: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="24" cy="25" r="14" fill="currentColor" fill-opacity=".15"/>
    <path d="M24 17v8l5 4M22 9h4"/>
  </svg>`,
  flag: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M12 8v32"/>
    <path d="M12 10c8-4 14 4 22 0v14c-8 4-14-4-22 0Z" fill="currentColor" fill-opacity=".2"/>
  </svg>`,
  cloud: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M14 32a7 7 0 0 1 0-14 9 9 0 0 1 17-2 7 7 0 0 1 1 14Z" fill="currentColor" fill-opacity=".18"/>
  </svg>`,
  moon: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 8a14 14 0 1 0 10 24A12 12 0 0 1 30 8Z" fill="currentColor" fill-opacity=".18"/>
    <circle cx="13" cy="14" r="1.4" fill="currentColor"/>
    <circle cx="40" cy="20" r="1" fill="currentColor"/>
  </svg>`,
  bookmark: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M14 8h20v32l-10-7-10 7Z" fill="currentColor" fill-opacity=".18"/>
  </svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2 14 8 20 9 15.5 13.5 16.7 20 12 16.8 7.3 20 8.5 13.5 4 9 10 8Z" fill="currentColor" fill-opacity=".4"/>
  </svg>`
};
