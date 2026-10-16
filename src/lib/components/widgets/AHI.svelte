<!--
  SPDX-License-Identifier: GPL-3.0-or-later
  Copyright (C) 2026 Marc Hoffmann (b14ckyy)
-->

<!-- Artificial Horizon Indicator — circular SVG with pitch/roll animation -->
<script lang="ts">
  import { untrack } from "svelte";
  import type { TelemetryData } from "$lib/stores/telemetry";
  import { flightPathVector } from "$lib/utils/flightPath";
  import { easeToward, easeAngleToward } from "$lib/utils/smoothing";

  let { telem, size = 22.5 }: { telem: TelemetryData; size?: number } = $props();

  const PITCH_SCALE = 3; // SVG units per degree of pitch

  // INAV: negative pitch = nose up, so negate for display
  let pitchPx = $derived(-telem.pitch * PITCH_SCALE);
  let rollDeg = $derived(-telem.roll);

  // ── Flight-path marker (velocity vector) ────────────────────────────
  // Body-frame (pilot's view): offset from the fixed aircraft symbol by crab (lateral) and AoA
  // (pitch − flight-path angle, vertical).
  const FPM_MAX_PX = 72; // keep the marker inside the dial
  const FPM_SMOOTH = 0.35; // per-update ease factor
  const clampPx = (v: number) => Math.max(-FPM_MAX_PX, Math.min(FPM_MAX_PX, v));

  let fpm = $derived(flightPathVector(telem.groundSpeed, telem.vario, telem.course, telem.yaw));
  let dispGamma = $state(0);
  let dispCrab = $state(0);

  let pitchDisp = $derived(-telem.pitch); // + = nose up
  let fpmX = $derived(100 + clampPx(dispCrab * PITCH_SCALE));
  let fpmY = $derived(100 + clampPx((pitchDisp - dispGamma) * PITCH_SCALE));

  // Ease the marker toward the target on every telemetry update. The self-read of dispGamma/dispCrab
  // is untracked so the effect doesn't re-trigger on its own writes (the project's telemetry-widget
  // pattern). A rAF reading the reactive target proved unreliable here (it froze → marker pinned).
  $effect(() => {
    const tg = fpm.gamma;
    const tc = fpm.crab;
    untrack(() => {
      dispGamma = easeToward(dispGamma, tg, FPM_SMOOTH);
      dispCrab = easeAngleToward(dispCrab, tc, FPM_SMOOTH);
    });
  });

  // Pitch ladder marks: major every 10°, minor every 5°
  const pitchMarks: { deg: number; hw: number; label: boolean }[] = [];
  for (let d = -30; d <= 30; d += 5) {
    if (d === 0) continue;
    pitchMarks.push({
      deg: d,
      hw: d % 10 === 0 ? 22 : 12,
      label: d % 10 === 0,
    });
  }

  // Digital readouts: pitch (+ = nose up) and bank with its side (telem.roll > 0 = right wing down).
  let pitchLabel = $derived(telem.lastUpdate ? `${pitchDisp > 0 ? '+' : ''}${Math.round(pitchDisp)}°` : '—');
  let bankLabel = $derived(
    telem.lastUpdate
      ? `${Math.round(telem.roll) === 0 ? '' : telem.roll > 0 ? 'R ' : 'L '}${Math.abs(Math.round(telem.roll))}°`
      : 'B —',
  );

  // Roll scale ticks (fixed on bezel)
  const rollTicks = [
    { angle: -60, len: 8 }, { angle: -45, len: 8 },
    { angle: -30, len: 12 }, { angle: -20, len: 8 },
    { angle: -10, len: 8 },
    { angle: 10, len: 8 }, { angle: 20, len: 8 },
    { angle: 30, len: 12 }, { angle: 45, len: 8 },
    { angle: 60, len: 8 },
  ];
</script>

<!-- VAYU attitude display: a rounded-square synthetic-vision panel (deep sky / slate terrain, cyan
     horizon glow), a roll arc across the top, a chevron aircraft symbol and digital pitch/bank chips. -->
<div class="ahi-container" style="--ahi-size: {size}">
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="vayu-ahi-clip">
        <rect x="7" y="7" width="186" height="186" rx="38" />
      </clipPath>
      <linearGradient id="vayu-ahi-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05142a" />
        <stop offset="70%" stop-color="#0f4c86" />
        <stop offset="100%" stop-color="#2b8ad0" />
      </linearGradient>
      <linearGradient id="vayu-ahi-gnd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a3a3c" />
        <stop offset="35%" stop-color="#182224" />
        <stop offset="100%" stop-color="#090e10" />
      </linearGradient>
      <radialGradient id="vayu-ahi-vignette" cx="50%" cy="50%" r="72%">
        <stop offset="60%" stop-color="#000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000" stop-opacity="0.55" />
      </radialGradient>
    </defs>

    <g clip-path="url(#vayu-ahi-clip)">
      <g transform="rotate({rollDeg}, 100, 100)">
        <rect x="-200" y={-400 + pitchPx} width="600" height="500" fill="url(#vayu-ahi-sky)" />
        <rect x="-200" y={100 + pitchPx} width="600" height="500" fill="url(#vayu-ahi-gnd)" />
        <!-- Horizon: a soft cyan glow under a crisp line -->
        <line x1="-200" y1={100 + pitchPx} x2="400" y2={100 + pitchPx} stroke="#67e8f9" stroke-width="6" opacity="0.18" />
        <line x1="-200" y1={100 + pitchPx} x2="400" y2={100 + pitchPx} stroke="#a5f3fc" stroke-width="1.6" />

        <!-- Pitch ladder: solid above the horizon, dashed below -->
        {#each pitchMarks as pm}
          {@const y = 100 - pm.deg * PITCH_SCALE + pitchPx}
          <line x1={100 - pm.hw} y1={y} x2={100 + pm.hw} y2={y}
                stroke="#e0f2fe" stroke-width={pm.label ? 1.3 : 0.9}
                stroke-dasharray={pm.deg < 0 ? '4 3' : undefined}
                opacity={pm.label ? 0.85 : 0.45} />
          {#if pm.label}
            <text x={100 + pm.hw + 5} y={y + 4} fill="#e0f2fe" font-size="11.5" opacity="0.8"
                  font-family="Bahnschrift, 'DIN Alternate', 'Segoe UI', sans-serif">{Math.abs(pm.deg)}</text>
            <text x={100 - pm.hw - 5} y={y + 4} fill="#e0f2fe" font-size="11.5" opacity="0.8" text-anchor="end"
                  font-family="Bahnschrift, 'DIN Alternate', 'Segoe UI', sans-serif">{Math.abs(pm.deg)}</text>
          {/if}
        {/each}
      </g>
      <rect x="7" y="7" width="186" height="186" fill="url(#vayu-ahi-vignette)" />
    </g>

    <!-- Roll arc + ticks (fixed) -->
    <path d="M {100 + 78 * Math.cos((-150) * Math.PI / 180)} {100 + 78 * Math.sin((-150) * Math.PI / 180)} A 78 78 0 0 1 {100 + 78 * Math.cos((-30) * Math.PI / 180)} {100 + 78 * Math.sin((-30) * Math.PI / 180)}"
          fill="none" stroke="#e0f2fe" stroke-width="1.2" opacity="0.45" />
    {#each rollTicks as rt}
      {@const rad = (rt.angle - 90) * Math.PI / 180}
      <line x1={100 + 78 * Math.cos(rad)} y1={100 + 78 * Math.sin(rad)}
            x2={100 + (78 - rt.len) * Math.cos(rad)} y2={100 + (78 - rt.len) * Math.sin(rad)}
            stroke="#e0f2fe" stroke-width="1.6" opacity="0.6" />
    {/each}
    <!-- Zero-bank index (fixed) + bank pointer (rotates) -->
    <polygon points="100,24 95,15 105,15" fill="#e0f2fe" />
    <g transform="rotate({rollDeg}, 100, 100)">
      <polygon points="100,25 95,34 105,34" fill="#22d3ee" />
    </g>

    <!-- Aircraft symbol: amber chevron with a dark outline -->
    <path d="M58 100 H84 L100 112 L116 100 H142" fill="none" stroke="#0b1017" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M58 100 H84 L100 112 L116 100 H142" fill="none" stroke="#fbbf24" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="100" cy="100" r="2.6" fill="#fbbf24" />

    <!-- Flight-path marker (velocity vector) -->
    {#if fpm.shown}
      <g opacity="0.95" stroke="#a3e635" stroke-width="2" stroke-linecap="round" fill="none">
        <circle cx={fpmX} cy={fpmY} r="6.5" />
        <line x1={fpmX - 6.5} y1={fpmY} x2={fpmX - 15} y2={fpmY} />
        <line x1={fpmX + 6.5} y1={fpmY} x2={fpmX + 15} y2={fpmY} />
        <line x1={fpmX} y1={fpmY - 6.5} x2={fpmX} y2={fpmY - 13} />
      </g>
    {/if}

    <!-- Digital pitch / bank chips -->
    <g font-family="Bahnschrift, 'DIN Alternate', 'Segoe UI', sans-serif" font-size="12" font-weight="600">
      <rect x="16" y="168" width="52" height="18" rx="6" fill="#05090e" fill-opacity="0.72" stroke="#38bdf8" stroke-opacity="0.35" />
      <text x="42" y="181" text-anchor="middle" fill="#e0f2fe" style="font-variant-numeric: tabular-nums">P {pitchLabel}</text>
      <rect x="132" y="168" width="52" height="18" rx="6" fill="#05090e" fill-opacity="0.72" stroke="#38bdf8" stroke-opacity="0.35" />
      <text x="158" y="181" text-anchor="middle" fill="#e0f2fe" style="font-variant-numeric: tabular-nums">{bankLabel}</text>
    </g>

    <!-- Frame -->
    <rect x="7" y="7" width="186" height="186" rx="38" fill="none" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="2" />
  </svg>
</div>

<style>
  .ahi-container {
    width: calc(var(--ahi-size, 150) * 1px);
    height: calc(var(--ahi-size, 150) * 1px);
  }

  svg {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 21%;
    background: #070b11;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.5);
  }
</style>
