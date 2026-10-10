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
    /** The app's hue: glyph colour, active glow and indicator dot (config/appIcons). */
    hue: string;
    /** The active tab / switched on — lit tile + bright dot. */
    active?: boolean;
    /** Open as a tab (not necessarily the active one) — gets the indicator dot, like a running app. */
    running?: boolean;
    /** Small badge dot in the tile's top-right corner (e.g. "live"). */
    badge?: 'live' | null;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  // App dock: a midnight glass shelf centred at the bottom of the screen that holds the view tabs
  // (Map / Video / Split), the panel apps (formerly the left nav rail) and a few utilities. Groups
  // are separated by a thin divider, like the iOS / macOS dock's recents split. Every tile is the
  // same dark glass; the app's identity is its glyph colour, which also lights the active tile.
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
          style:--hue={item.hue}
          onclick={() => onSelect(item.id)}
          aria-label={item.label}
          aria-pressed={item.active ?? false}
        >
          <span class="dock-tile">
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
    gap: calc(var(--tile) * 0.24);
    max-width: 100%;
    box-sizing: border-box;
    padding: 8px 12px 7px;
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(22, 31, 44, 0.78), rgba(9, 13, 19, 0.88));
    border: 1px solid rgba(148, 178, 214, 0.14);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 0 0 1px rgba(0, 0, 0, 0.35),
      0 14px 34px rgba(0, 0, 0, 0.55);
    backdrop-filter: var(--glass-blur, blur(16px)) saturate(150%);
    -webkit-backdrop-filter: var(--glass-blur, blur(16px)) saturate(150%);
  }

  .dock-group {
    display: flex;
    align-items: flex-end;
    gap: calc(var(--tile) * 0.17);
  }

  .dock-sep {
    align-self: stretch;
    width: 1px;
    margin: 6px 0 12px;
    background: linear-gradient(180deg, transparent, rgba(148, 178, 214, 0.28), transparent);
    flex-shrink: 0;
  }

  .dock-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
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
    /* App-icon "squircle" approximation: ~24% corner radius. */
    border-radius: calc(var(--tile) * 0.26);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--hue);
    background:
      radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--hue) 10%, transparent), transparent 70%),
      linear-gradient(180deg, #1a2433, #0f1620);
    border: 1px solid rgba(148, 178, 214, 0.12);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.07),
      0 2px 6px rgba(0, 0, 0, 0.45);
    transition: transform 0.18s cubic-bezier(0.3, 0.7, 0.4, 1.4), box-shadow 0.2s ease, background 0.2s ease,
      border-color 0.2s ease;
    transform-origin: 50% 100%;
    box-sizing: border-box;
  }

  /* macOS-style hover magnification (pointer devices only — no sticky hover on touch). */
  @media (hover: hover) {
    .dock-item:not(:disabled):hover .dock-tile {
      transform: translateY(-6px) scale(1.14);
      border-color: color-mix(in srgb, var(--hue) 45%, transparent);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.08),
        0 0 18px color-mix(in srgb, var(--hue) 22%, transparent),
        0 10px 18px rgba(0, 0, 0, 0.5);
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
    box-shadow: 0 0 0 2px #38bdf8, 0 2px 6px rgba(0, 0, 0, 0.45);
  }

  /* Active: the tile lights up in the app's hue. */
  .dock-item.active .dock-tile {
    background:
      radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--hue) 34%, transparent), transparent 75%),
      linear-gradient(180deg, color-mix(in srgb, var(--hue) 16%, #1a2433), #0f1620);
    border-color: color-mix(in srgb, var(--hue) 70%, transparent);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 0 1px color-mix(in srgb, var(--hue) 25%, transparent),
      0 0 20px color-mix(in srgb, var(--hue) 35%, transparent),
      0 2px 6px rgba(0, 0, 0, 0.45);
  }

  .dock-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: calc(var(--tile) * 0.3);
    font-weight: 700;
    line-height: 1;
  }
  .dock-icon :global(svg) {
    width: calc(var(--tile) * 0.58);
    height: calc(var(--tile) * 0.58);
    display: block;
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--hue) 25%, transparent));
  }

  .dock-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ff4d5e;
    border: 2px solid #0b1017;
    box-shadow: 0 0 8px rgba(255, 77, 94, 0.8);
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
    transition: background-color 0.2s, box-shadow 0.2s;
  }
  .dock-item.running .dock-dot {
    background: color-mix(in srgb, var(--hue) 55%, #64748b);
  }
  .dock-item.active .dock-dot {
    width: 14px;
    border-radius: 2px;
    background: var(--hue);
    box-shadow: 0 0 8px var(--hue);
  }

  /* Name bubble above the hovered icon (the dock itself carries no labels, like iOS). */
  .dock-label {
    position: absolute;
    bottom: calc(100% + 16px);
    left: 50%;
    transform: translate(-50%, 4px);
    padding: 4px 10px;
    border-radius: 8px;
    background: rgba(9, 13, 19, 0.94);
    border: 1px solid rgba(148, 178, 214, 0.18);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
    color: #e3eaf3;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.2px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.12s ease, transform 0.12s ease;
  }
</style>
