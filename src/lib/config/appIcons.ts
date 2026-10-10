// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Marc Hoffmann (b14ckyy)

// App icons for the App Dock, the tab bar and the start page: one family on a 24px grid, 1.7px
// rounded strokes with a soft duotone fill (`currentColor` at low opacity), so every glyph takes
// its app's hue from the tile. Same meanings as the nav rail's icons, drawn as one set.

const svg = (body: string, strokeWidth = 1.7) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const SOFT = 'fill="currentColor" fill-opacity="0.2"';
const SOLID = 'fill="currentColor" stroke="none"';

export const APP_ICONS: Record<string, string> = {
  // ── Views ──
  'view:map': svg(
    `<path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5Z" ${SOFT}/><path d="M9 4.5v13M15 6.5v13"/>`,
  ),
  'view:video': svg(
    `<rect x="2.5" y="4.5" width="19" height="15" rx="3.2" ${SOFT}/><path d="M10 9.1v5.8l4.9-2.9Z" fill="currentColor"/>`,
  ),
  'view:split': svg(
    `<path d="M12 4.5H5.7a3.2 3.2 0 0 0-3.2 3.2v8.6a3.2 3.2 0 0 0 3.2 3.2H12Z" fill="currentColor" fill-opacity="0.32" stroke="none"/><rect x="2.5" y="4.5" width="19" height="15" rx="3.2"/><path d="M12 4.5v15"/>`,
  ),

  // ── Panels ──
  // Quadcopter, top view (UAV Info).
  'uav-info': svg(
    `<path d="M9.6 9.6 7.6 7.6M14.4 9.6l2-2M9.6 14.4l-2 2M14.4 14.4l2 2"/><rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1.6" ${SOFT}/><circle cx="6" cy="6" r="2.6"/><circle cx="18" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><circle cx="18" cy="18" r="2.6"/>`,
  ),
  // Dashed route through a waypoint to a target pin (Mission).
  mission: svg(
    `<path d="M6 18.2 11.5 14l3.6-1.4" stroke-dasharray="2.1 2.3"/><circle cx="5.5" cy="18.5" r="2" ${SOFT}/><circle cx="11.5" cy="14" r="1.5" ${SOLID}/><path d="M17.2 3.5a3.4 3.4 0 0 0-3.4 3.4c0 2.5 3.4 5.9 3.4 5.9s3.4-3.4 3.4-5.9a3.4 3.4 0 0 0-3.4-3.4Z" ${SOFT}/><circle cx="17.2" cy="6.9" r="1.1" ${SOLID}/>`,
  ),
  // Gamepad (Vehicle Control).
  control: svg(
    `<path d="M7.2 7h9.6a5 5 0 0 1 4.8 6.4l-1 3.4a2.6 2.6 0 0 1-4.3 1.2L14 15.6h-4L7.7 18a2.6 2.6 0 0 1-4.3-1.2l-1-3.4A5 5 0 0 1 7.2 7Z" ${SOFT}/><path d="M7.6 10.2v3.6M5.8 12h3.6"/><circle cx="16" cy="10.9" r="1" ${SOLID}/><circle cx="17.9" cy="13" r="1" ${SOLID}/>`,
  ),
  // RC transmitter: two gimbals + antenna.
  'rc-control': svg(
    `<path d="M17 6.5V2.8"/><circle cx="17" cy="2.8" r="0.4" ${SOLID}/><rect x="3" y="6.5" width="18" height="13.5" rx="3.2" ${SOFT}/><circle cx="8.2" cy="12.4" r="2.4"/><circle cx="15.8" cy="12.4" r="2.4"/><circle cx="8.2" cy="12.4" r="0.7" ${SOLID}/><circle cx="15.8" cy="12.4" r="0.7" ${SOLID}/><path d="M10 17.2h4"/>`,
  ),
  // Peaks with a snow line + ground (Terrain).
  terrain: svg(
    `<path d="M2.5 19.5 8.6 8.5l3.7 6.4 2.6-3.9 6.6 8.5Z" ${SOFT}/><path d="M6.9 11.6 8.6 8.5l1.8 3.1-1 .8-.8-.7-.8.7Z" fill="currentColor" fill-opacity="0.55"/><path d="M2.5 21.5h19" stroke-opacity="0.55"/>`,
  ),
  // Bound flight log with a bookmark (Logbook).
  logbook: svg(
    `<path d="M5 5a2 2 0 0 1 2-2h12v15.5H7a2 2 0 0 0-2 2Z" ${SOFT}/><path d="M5 20.5A1.5 1.5 0 0 0 6.5 22H19v-3.5"/><path d="M9 7.5h6M9 11h4"/><path d="M15.5 3v5l1.3-1 1.2 1V3" fill="currentColor" fill-opacity="0.55"/>`,
  ),
  // Scope with sweep wedge + contacts (Radar).
  radar: svg(
    `<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity="0.12"/><path d="M12 3.5A8.5 8.5 0 0 1 18 6L12 12Z" fill="currentColor" fill-opacity="0.38" stroke="none"/><circle cx="12" cy="12" r="4.3"/><path d="M12 12 18 6"/><circle cx="16.2" cy="14.6" r="1.15" ${SOLID}/><circle cx="8.3" cy="8.9" r="0.9" ${SOLID}/>`,
  ),
  // Stacked airspace layers (Airspace).
  airspace: svg(
    `<path d="M12 3.5 21 8l-9 4.5L3 8Z" ${SOFT}/><path d="M3 12.2l9 4.5 9-4.5"/><path d="M3 16.3l9 4.5 9-4.5"/>`,
  ),
  // Camera with a record light (Video source).
  video: svg(
    `<rect x="2.5" y="6.5" width="13" height="11" rx="2.6" ${SOFT}/><path d="M15.5 10.4 21.5 7v10l-6-3.4Z"/><circle cx="6.4" cy="10.3" r="1.2" ${SOLID}/>`,
  ),
  // Sliders (Settings).
  settings: svg(
    `<path d="M4 7h8.5M17.5 7H20M4 12h2.5M11.5 12H20M4 17h10.5M19.5 17h.5"/><circle cx="15" cy="7" r="2.3" ${SOFT}/><circle cx="9" cy="12" r="2.3" ${SOFT}/><circle cx="17" cy="17" r="2.3" ${SOFT}/>`,
  ),
  // Code brackets (DEV Playground).
  'dev-playground': svg(`<path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5M13.4 5.2l-2.8 13.6"/>`, 1.8),

  // ── Utilities ──
  // Gauge (Widgets).
  'util:widgets': svg(
    `<path d="M3.5 17a8.5 8.5 0 1 1 17 0Z" fill="currentColor" fill-opacity="0.14" stroke="none"/><path d="M3.5 17a8.5 8.5 0 1 1 17 0"/><path d="M12 15.4 16.2 10"/><circle cx="12" cy="15.4" r="1.7" ${SOLID}/><path d="M6.6 12.4l.9.5M12 7v1M17.4 12.4l-.9.5"/>`,
  ),
  'util:fullscreen': svg(`<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>`, 1.9),
  'util:fullscreen-exit': svg(`<path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20"/>`, 1.9),
};

/** Each app's hue: the glyph colour, the active glow and the indicator dot. Tuned to read on the
 *  midnight tiles without shouting — one family, distinct at a glance. */
export const APP_HUES: Record<string, string> = {
  'view:map': '#34d399',
  'view:video': '#fb7185',
  'view:split': '#a78bfa',
  'uav-info': '#7dd3fc',
  mission: '#fbbf24',
  control: '#c084fc',
  'rc-control': '#f472b6',
  terrain: '#e0b072',
  logbook: '#facc15',
  radar: '#4ade80',
  airspace: '#38bdf8',
  video: '#fb923c',
  settings: '#cbd5e1',
  'dev-playground': '#94a3b8',
  'util:widgets': '#2dd4bf',
  'util:fullscreen': '#cbd5e1',
};
export const FALLBACK_HUE = '#94a3b8';
