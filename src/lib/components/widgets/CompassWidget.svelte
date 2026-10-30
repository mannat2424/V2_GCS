<!--
  SPDX-License-Identifier: GPL-3.0-or-later
  Copyright (C) 2026 Marc Hoffmann (b14ckyy)
-->

<!-- Compass widget — rotating compass rose with heading display -->
<script lang="ts">
  import type { TelemetryData } from "$lib/stores/telemetry";
  import type { InterfaceSettings } from "$lib/stores/settings";
  import { convertSpeed, speedDigits } from "$lib/utils/units";
  import { t } from 'svelte-i18n';

  let {
    telem,
    size = 22.5,
    interfaceSettings = { speedUnit: 'kmh', altitudeUnit: 'm', distanceUnit: 'metric', verticalSpeedUnit: 'ms', temperatureUnit: 'c' },
  }: {
    telem: TelemetryData;
    size?: number;
    interfaceSettings?: InterfaceSettings;
  } = $props();

  let rotation = $derived(-telem.yaw);

  // Course-over-ground (track) bug. COG is noise at standstill, so only show it while moving.
  const COG_MIN_SPEED = 1.5; // m/s
  let cogShown = $derived(!!telem.lastUpdate && telem.groundSpeed > COG_MIN_SPEED);

  // Wind arrow (translucent, pinned to the rose rim): fixed-size arrow whose tip sits at the rim,
  // pointing downwind (drift direction). Speed is shown as a number below the heading instead of via
  // length (kept legible at low wind). Hidden when calm / no estimate.
  const WIND_MIN_MS = 0.3;
  let windShown = $derived(!!telem.lastUpdate && telem.windSpeedMs > WIND_MIN_MS);
  let windDownwind = $derived((telem.windDirFrom + 180) % 360);
  let windSpeedConv = $derived(convertSpeed(telem.windSpeedMs, interfaceSettings.speedUnit));

  function cardinalLabel(heading: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(heading / 45) % 8];
  }

  // Tick marks every 10°
  const ticks: { deg: number; major: boolean }[] = [];
  for (let i = 0; i < 360; i += 10) {
    ticks.push({ deg: i, major: i % 30 === 0 });
  }
</script>

<!-- VAYU heading display: a rounded-square panel with an aviation rose (numbers every 30°, amber N),
     the heading in a box at the top, a fixed aircraft symbol in the centre and COG / wind chips. -->
<div class="compass-container" style="--ws: {size}px">
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="vayu-hdg-face" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#0d2a2c" />
        <stop offset="100%" stop-color="#051011" />
      </radialGradient>
    </defs>
    <rect x="7" y="7" width="186" height="186" rx="38" fill="url(#vayu-hdg-face)" />

    <!-- Rotating rose (centre 100,110) -->
    <g transform="rotate({rotation}, 100, 110)">
      {#if windShown}
        <g transform="rotate({windDownwind}, 100, 110)" opacity="0.5">
          <line x1="100" y1="74" x2="100" y2="50" stroke="#5eead4" stroke-width="5" stroke-linecap="round" />
          <polygon points="100,40 92,54 108,54" fill="#5eead4" />
        </g>
      {/if}
      <circle cx="100" cy="110" r="72" fill="none" stroke="#5eead4" stroke-opacity="0.22" stroke-width="1.5" />
      {#each ticks as tk}
        {@const rad = (tk.deg - 90) * Math.PI / 180}
        {@const inner = tk.major ? 61 : 66}
        <line x1={100 + 72 * Math.cos(rad)} y1={110 + 72 * Math.sin(rad)}
              x2={100 + inner * Math.cos(rad)} y2={110 + inner * Math.sin(rad)}
              stroke={tk.deg === 0 ? '#fbbf24' : '#d5f5ef'} stroke-width={tk.major ? 2 : 1}
              opacity={tk.major ? 0.85 : 0.35} />
      {/each}
      {#each [30, 60, 120, 150, 210, 240, 300, 330] as d}
        <text x="100" y="56" text-anchor="middle" dominant-baseline="middle"
              transform="rotate({d}, 100, 110)" fill="#78968f" font-size="11" font-weight="600"
              font-family="Bahnschrift, 'DIN Alternate', 'Segoe UI', sans-serif">{d / 10}</text>
      {/each}
      <g font-family="Bahnschrift, 'DIN Alternate', 'Segoe UI', sans-serif" font-weight="700" font-size="17"
         text-anchor="middle" dominant-baseline="middle">
        <text x="100" y="58" fill="#fbbf24">{$t('compass.n')}</text>
        <text x="100" y="58" fill="#d5f5ef" transform="rotate(90, 100, 110)">{$t('compass.e')}</text>
        <text x="100" y="58" fill="#d5f5ef" transform="rotate(180, 100, 110)">{$t('compass.s')}</text>
        <text x="100" y="58" fill="#d5f5ef" transform="rotate(270, 100, 110)">{$t('compass.w')}</text>
      </g>
      {#if cogShown}
        <g transform="rotate({telem.course}, 100, 110)">
          <polygon points="100,46 94,34 106,34" fill="#f5a623" opacity="0.9" />
        </g>
      {/if}
    </g>

    <!-- Fixed aircraft symbol (top view) -->
    <path d="M100 92 L104 104 L120 112 L120 116 L104 113 L103 124 L109 129 L109 132 L100 130 L91 132 L91 129 L97 124 L96 113 L80 116 L80 112 L96 104 Z"
          fill="#2dd4bf" fill-opacity="0.9" stroke="#071315" stroke-width="1.2" stroke-linejoin="round" />

    <!-- Heading box (lubber line underneath points at the rose) -->
    <polygon points="100,44 95,36 105,36" fill="#2dd4bf" />
    <rect x="68" y="12" width="64" height="26" rx="8" fill="#030b0c" stroke="#2dd4bf" stroke-width="1.5" />
    <text x="100" y="26" text-anchor="middle" dominant-baseline="middle" fill="#eefaf7" font-size="17" font-weight="600"
          font-family="Bahnschrift, 'DIN Alternate', 'Segoe UI', sans-serif"
          style="font-variant-numeric: tabular-nums">{telem.lastUpdate ? String(Math.round(telem.yaw) % 360).padStart(3, '0') + '°' : '———'}</text>

    <!-- COG (amber) and wind (blue) chips in the lower corners -->
    <g font-family="Bahnschrift, 'DIN Alternate', 'Segoe UI', sans-serif" font-size="11.5" font-weight="600"
       style="font-variant-numeric: tabular-nums">
      {#if cogShown}
        <text x="16" y="186" fill="#f5a623">TRK {Math.round(telem.course)}°</text>
      {/if}
      {#if windShown}
        <text x="184" y="186" text-anchor="end" fill="#5eead4">{windSpeedConv.value.toFixed(speedDigits(interfaceSettings.speedUnit))} {windSpeedConv.unit}</text>
      {/if}
    </g>

    <rect x="7" y="7" width="186" height="186" rx="38" fill="none" stroke="#2dd4bf" stroke-opacity="0.35" stroke-width="2" />
  </svg>
</div>

<style>
  .compass-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    width: var(--ws);
    height: var(--ws);
    display: block;
    border-radius: 21%;
    background: #040c0d;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.5);
  }
</style>
