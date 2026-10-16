// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Marc Hoffmann (b14ckyy)

import { writable, get } from 'svelte/store';

// ── Main view mode (the App Dock's view tabs) ───────────────────
// `map`   = the full-screen map (video, if running, sits in the floating window).
// `video` = the full-screen video; the map moves into the floating window as a PiP.
// `split` = map and video side by side with a draggable divider.
// Self-contained persistence (own localStorage key, like the video store).

export type ViewMode = 'map' | 'video' | 'split';

export interface ViewModeState {
  mode: ViewMode;
  /** Divider position as a fraction of the window width (split view). */
  splitFrac: number;
  /** Split view: the map is the LEFT pane (true) or the right one (false). */
  mapLeft: boolean;
  /** Side-by-side tabs (Mission, Terrain, …): the panel pane's width as a fraction of the window. */
  sideFrac: number;
  /** Cockpit sidebar width (logical px) the pilot dragged it to; 0 = automatic. */
  sidebarW: number;
  /** Cockpit sidebar folded away (the map takes its room). */
  sidebarCollapsed: boolean;
  /** Tabs open in the tab bar, in bar order: `view:<mode>` (Map / Video / Split) and
   *  `tab:<panel id>` ('tab:uav-info', 'tab:mission', …). */
  openTabs: string[];
}

const STORAGE_KEY = 'kite-gc-view';
export const SPLIT_FRAC_MIN = 0.2;
/** Height of the App Dock's grid row (logical px, desktop + tablet): the frosted shelf plus its gap
 *  above the status bar. Everything that used to sit on the status bar now sits on this row. */
export const APP_DOCK_PX = 72;
export const SPLIT_FRAC_MAX = 0.8;
/** Height of the browser-style tab bar under the toolbar (logical px, desktop + tablet). */
export const TAB_BAR_PX = 34;

const DEFAULTS: ViewModeState = { mode: 'map', splitFrac: 0.5, mapLeft: true, sideFrac: 0.4, sidebarW: 0, sidebarCollapsed: false, openTabs: ['view:map'] };
export const SIDE_FRAC_MIN = 0.25;
export const SIDE_FRAC_MAX = 0.65;
function clampSide(f: number): number {
  return Math.min(SIDE_FRAC_MAX, Math.max(SIDE_FRAC_MIN, f));
}
const VIEW_KEYS = ['view:map', 'view:video', 'view:split'];

/** Stored tab list → keys. The first tab-bar version stored bare panel ids next to three pinned
 *  view tabs; those come back as keys with the view tabs in front, as they were shown. */
function loadTabs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULTS.openTabs];
  const list = raw.filter((x): x is string => typeof x === 'string');
  const keys = list.some((x) => !x.includes(':'))
    ? [...VIEW_KEYS, ...list.map((x) => (x.includes(':') ? x : `tab:${x}`))]
    : list;
  // A key may only appear once (the tab bar is keyed by it). A mixed list — old bare ids next to
  // keys — would otherwise bring the view tabs back twice.
  return [...new Set(keys)];
}

function load(): ViewModeState {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return { ...DEFAULTS };
    const p = JSON.parse(raw) as Partial<ViewModeState>;
    return {
      mode: p.mode === 'video' || p.mode === 'split' ? p.mode : 'map',
      splitFrac: clampFrac(typeof p.splitFrac === 'number' ? p.splitFrac : DEFAULTS.splitFrac),
      mapLeft: p.mapLeft !== false,
      sideFrac: clampSide(typeof p.sideFrac === 'number' ? p.sideFrac : DEFAULTS.sideFrac),
      sidebarW: typeof p.sidebarW === 'number' && p.sidebarW > 0 ? p.sidebarW : 0,
      sidebarCollapsed: p.sidebarCollapsed === true,
      openTabs: loadTabs(p.openTabs),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function clampFrac(f: number): number {
  return Math.min(SPLIT_FRAC_MAX, Math.max(SPLIT_FRAC_MIN, f));
}

export const viewMode = writable<ViewModeState>(load());

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get(viewMode)));
  } catch {
    // storage unavailable — the view simply isn't remembered
  }
}

function patch(p: Partial<ViewModeState>): void {
  viewMode.update((s) => ({ ...s, ...p }));
  save();
  // Leaflet / Cesium re-fit to the new pane size (the Map's ResizeObserver is the backstop).
  if (typeof window !== 'undefined') setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
}

export function setViewMode(mode: ViewMode): void {
  if (get(viewMode).mode !== mode) patch({ mode });
}

/** Divider drag — not persisted per move (see commitSplit). */
export function setSplitFrac(frac: number): void {
  viewMode.update((s) => ({ ...s, splitFrac: clampFrac(frac) }));
}

/** Side-by-side divider drag — not persisted per move (see commitSplit). */
export function setSideFrac(frac: number): void {
  viewMode.update((s) => ({ ...s, sideFrac: clampSide(frac) }));
}

/** Sidebar edge drag — not persisted per move (see commitSplit); 0 restores the automatic width. */
export function setSidebarW(w: number): void {
  viewMode.update((s) => ({ ...s, sidebarW: Math.round(w) }));
}

export function setSidebarCollapsed(sidebarCollapsed: boolean): void {
  patch({ sidebarCollapsed });
}

/** End of a divider drag: persist + one resize for the map. */
export function commitSplit(): void {
  patch({});
}

export function swapSplitSides(): void {
  patch({ mapLeft: !get(viewMode).mapLeft });
}

/** Add a tab key to the tab bar (no-op when already open). Appended at the end, like a browser. */
export function addOpenTab(id: string): void {
  if (get(viewMode).openTabs.includes(id)) return;
  viewMode.update((s) => ({ ...s, openTabs: [...s.openTabs, id] }));
  save();
}

export function removeOpenTab(id: string): void {
  if (!get(viewMode).openTabs.includes(id)) return;
  viewMode.update((s) => ({ ...s, openTabs: s.openTabs.filter((t) => t !== id) }));
  save();
}
