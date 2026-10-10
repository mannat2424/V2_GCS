<!--
  SPDX-License-Identifier: GPL-3.0-or-later
  Copyright (C) 2026 Marc Hoffmann (b14ckyy)
-->

<script lang="ts" module>
  /** One app icon in the dock. `icon` is a trusted, app-defined inline SVG string (or a glyph). */
  export interface DockItem {
    id: string;
    label: string;
    icon: string;
    /** Tile gradient: [top, bottom] colours. */
    tint: [string, string];
    /** The active tab / switched on — gets the ring. */
    active?: boolean;
    /** Open as a tab (not necessarily the active one) — gets the indicator dot, like a running app. */
    running?: boolean;
    /** Small badge dot in the tile's top-right corner (e.g. "live"). */
    badge?: 'live' | null;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  // iOS-style app dock: a frosted glass shelf centred at the bottom of the screen that holds the
  // view tabs (Map / Video / Split), the panel apps (formerly the left nav rail) and a few
  // utilities. Groups are separated by a thin divider, like the iOS / macOS dock's recents split.
  let {
    groups,
    onSelect,
  }: {
    groups: DockItem[][];
    onSelect: (id: string) => void;
  } = $props();

  const visibleGroups = $derived(groups.filter((g) => g.length > 0));
</script>

<nav class="app-dock" aria-label="App dock">
  {#each visibleGroups as group, gi (gi)}
    {#if gi > 0}<div class="dock-sep" aria-hidden="true"></div>{/if}
    <div class="dock-group">
      {#each group as item (item.id)}
        <button
          class="dock-item"
          class:active={item.active}
          class:running={item.running || item.active}
          disabled={item.disabled}
          onclick={() => onSelect(item.id)}
          aria-label={item.label}
          aria-pressed={item.active ?? false}
        >
          <span class="dock-tile" style:--t1={item.tint[0]} style:--t2={item.tint[1]}>
            <!-- icon is an app-defined inline SVG string (trusted) -->
            <span class="dock-icon">{@html item.icon}</span>
            {#if item.badge === 'live'}<span class="dock-badge" aria-hidden="true"></span>{/if}
          </span>
          <span class="dock-dot" aria-hidden="true"></span>
          <span class="dock-label" role="tooltip">{item.label}</span>
        </button>
      {/each}
    </div>
  {/each}
</nav>

<style>
  .app-dock {
    /* Tiles shrink with the window so every app fits without a scroller (a scroll box would clip
       the hover lift and the name bubbles above the shelf). */
    --tile: clamp(32px, 3.3vw, 46px);
    display: flex;
    align-items: flex-end;
    gap: calc(var(--tile) * 0.22);
    max-width: 100%;
    box-sizing: border-box;
    padding: 7px 12px 9px;
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(58, 62, 68, 0.62), rgba(28, 30, 34, 0.72));
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 10px 30px rgba(0, 0, 0, 0.45);
    backdrop-filter: var(--glass-blur, blur(14px)) saturate(160%);
    -webkit-backdrop-filter: var(--glass-blur, blur(14px)) saturate(160%);
  }

  .dock-group {
    display: flex;
    align-items: flex-end;
    gap: calc(var(--tile) * 0.17);
  }

  .dock-sep {
    align-self: stretch;
    width: 1px;
    margin: 4px 0 8px;
    background: rgba(255, 255, 255, 0.18);
    flex-shrink: 0;
  }

  .dock-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .dock-item:disabled {
    cursor: default;
    opacity: 0.35;
  }

  .dock-tile {
    position: relative;
    width: var(--tile);
    height: var(--tile);
    /* iOS app-icon "squircle" approximation: ~22.5% corner radius. */
    border-radius: calc(var(--tile) * 0.235);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: linear-gradient(180deg, var(--t1), var(--t2));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.28),
      inset 0 -1px 0 rgba(0, 0, 0, 0.18),
      0 2px 6px rgba(0, 0, 0, 0.35);
    transition: transform 0.18s cubic-bezier(0.3, 0.7, 0.4, 1.4), box-shadow 0.18s ease, filter 0.18s ease;
    transform-origin: 50% 100%;
  }

  /* macOS-style hover magnification (pointer devices only — no sticky hover on touch). */
  @media (hover: hover) {
    .dock-item:not(:disabled):hover .dock-tile {
      transform: translateY(-6px) scale(1.14);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        0 8px 16px rgba(0, 0, 0, 0.45);
    }
    .dock-item:not(:disabled):hover .dock-label {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
  .dock-item:not(:disabled):active .dock-tile {
    transform: scale(0.92);
    filter: brightness(0.85);
  }
  .dock-item:focus-visible {
    outline: none;
  }
  .dock-item:focus-visible .dock-tile {
    box-shadow: 0 0 0 2px #37a8db, 0 2px 6px rgba(0, 0, 0, 0.35);
  }

  /* Active: a bright inner ring on the tile + the indicator dot underneath. */
  .dock-item.active .dock-tile {
    box-shadow:
      inset 0 0 0 2px rgba(255, 255, 255, 0.85),
      0 0 14px color-mix(in srgb, var(--t1) 70%, transparent),
      0 2px 6px rgba(0, 0, 0, 0.35);
  }

  .dock-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
  }
  .dock-icon :global(svg) {
    width: calc(var(--tile) * 0.6);
    height: calc(var(--tile) * 0.6);
    display: block;
  }

  .dock-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #ff3b30;
    border: 2px solid rgba(30, 32, 36, 0.95);
    animation: dock-pulse 1.6s ease-in-out infinite;
  }
  @keyframes dock-pulse {
    50% { opacity: 0.45; }
  }

  .dock-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: transparent;
    transition: background-color 0.2s;
  }
  .dock-item.running .dock-dot {
    background: rgba(255, 255, 255, 0.55);
  }
  .dock-item.active .dock-dot {
    background: rgba(255, 255, 255, 0.95);
  }

  /* Name bubble above the hovered icon (the dock itself carries no labels, like iOS). */
  .dock-label {
    position: absolute;
    bottom: calc(100% + 14px);
    left: 50%;
    transform: translate(-50%, 4px);
    padding: 4px 9px;
    border-radius: 7px;
    background: rgba(22, 24, 28, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #f0f0f0;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.12s ease, transform 0.12s ease;
  }
</style>
