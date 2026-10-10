<!--
  SPDX-License-Identifier: GPL-3.0-or-later
  Copyright (C) 2026 Marc Hoffmann (b14ckyy)
-->

<script lang="ts" module>
  export interface TabBarItem {
    /** `view:<mode>` for the pinned view tabs, `tab:<panel id>` for panel tabs. */
    key: string;
    label: string;
    /** Trusted, app-defined inline SVG string (or a short glyph). */
    icon: string;
    /** Icon tile gradient [top, bottom] — the same colours as the dock tile. */
    tint: [string, string];
    /** Pinned tabs (Map / Video / Split) have no close button. */
    pinned?: boolean;
    /** Small red "live" dot on the tab icon. */
    live?: boolean;
  }
</script>

<script lang="ts">
  // Browser-style tab strip under the toolbar: the pinned view tabs on the left, then every panel
  // opened from the dock as its own closable tab. Click activates, × or a middle-click closes.
  import { t } from 'svelte-i18n';

  let {
    tabs,
    activeKey,
    onActivate,
    onClose,
  }: {
    tabs: TabBarItem[];
    activeKey: string;
    onActivate: (key: string) => void;
    onClose: (key: string) => void;
  } = $props();

  const pinned = $derived(tabs.filter((tab) => tab.pinned));
  const closable = $derived(tabs.filter((tab) => !tab.pinned));

  function onAux(e: MouseEvent, tab: TabBarItem) {
    if (e.button === 1 && !tab.pinned) {
      e.preventDefault();
      onClose(tab.key);
    }
  }

  // Keep the active tab in view when the strip overflows.
  let strip = $state<HTMLDivElement | null>(null);
  $effect(() => {
    const key = activeKey;
    const el = strip?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
</script>

{#snippet tabEl(tab: TabBarItem)}
  <div
    class="tb-tab"
    class:active={tab.key === activeKey}
    class:pinned={tab.pinned}
    data-key={tab.key}
    role="tab"
    tabindex="0"
    aria-selected={tab.key === activeKey}
    title={tab.label}
    onclick={() => onActivate(tab.key)}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(tab.key); } }}
    onauxclick={(e) => onAux(e, tab)}
    onmousedown={(e) => { if (e.button === 1) e.preventDefault(); }}
  >
    <span class="tb-icon" style:--t1={tab.tint[0]} style:--t2={tab.tint[1]}>
      {@html tab.icon}
      {#if tab.live}<span class="tb-live" aria-hidden="true"></span>{/if}
    </span>
    <span class="tb-label">{tab.label}</span>
    {#if !tab.pinned}
      <button
        class="tb-close"
        title={$t('dock.closeTab')}
        aria-label="{$t('dock.closeTab')}: {tab.label}"
        onclick={(e) => { e.stopPropagation(); onClose(tab.key); }}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" /></svg>
      </button>
    {/if}
  </div>
{/snippet}

<div class="tab-bar" role="tablist" aria-label="Tabs">
  <div class="tb-pinned">
    {#each pinned as tab (tab.key)}{@render tabEl(tab)}{/each}
  </div>
  {#if pinned.length > 0 && closable.length > 0}<div class="tb-sep" aria-hidden="true"></div>{/if}
  <div class="tb-strip" bind:this={strip}>
    {#each closable as tab (tab.key)}{@render tabEl(tab)}{/each}
  </div>
</div>

<style>
  .tab-bar {
    height: 100%;
    display: flex;
    align-items: flex-end;
    gap: 0;
    padding: 0 8px;
    box-sizing: border-box;
    background: linear-gradient(180deg, #1c1e22, #222428);
    border-bottom: 1px solid #33373d;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    min-width: 0;
  }

  .tb-pinned,
  .tb-strip {
    display: flex;
    align-items: flex-end;
    height: 100%;
    min-width: 0;
  }
  .tb-pinned {
    flex-shrink: 0;
  }
  .tb-strip {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }
  .tb-strip::-webkit-scrollbar {
    display: none;
  }

  .tb-sep {
    align-self: center;
    width: 1px;
    height: 18px;
    margin: 0 6px;
    background: rgba(255, 255, 255, 0.14);
    flex-shrink: 0;
  }

  .tb-tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    height: 28px;
    min-width: 0;
    max-width: 190px;
    flex: 0 1 190px;
    padding: 0 6px 0 9px;
    margin-right: 2px;
    border-radius: 8px 8px 0 0;
    color: #a3a7ad;
    font-size: 12.5px;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
    transition: background-color 0.12s, color 0.12s;
    outline: none;
  }
  .tb-tab.pinned {
    flex: 0 0 auto;
    padding-right: 11px;
  }
  .tb-tab:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #e2e4e7;
  }
  .tb-tab:focus-visible {
    box-shadow: inset 0 0 0 1px #37a8db;
  }
  /* Active: the tab "opens into" the content below — lighter ground, accent top edge, and it
     covers the strip's bottom border. */
  .tb-tab.active {
    background: #2e3136;
    color: #fff;
    box-shadow: inset 0 2px 0 #37a8db;
  }
  .tb-tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 1px;
    background: #2e3136;
  }
  /* Thin separators between inactive neighbours, like Chrome. */
  .tb-tab:not(.active) + .tb-tab:not(.active)::before {
    content: '';
    position: absolute;
    left: -1px;
    top: 7px;
    bottom: 7px;
    width: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  .tb-icon {
    position: relative;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 7px;
    font-weight: 700;
    background: linear-gradient(180deg, var(--t1), var(--t2));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }
  .tb-icon :global(svg) {
    width: 13px;
    height: 13px;
    display: block;
  }
  .tb-live {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ff3b30;
    border: 1.5px solid #1c1e22;
  }

  .tb-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tb-close {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    padding: 4px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
  }
  .tb-close:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.14);
  }
  .tb-close svg {
    display: block;
    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
  }
</style>
