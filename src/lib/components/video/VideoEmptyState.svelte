<!--
  SPDX-License-Identifier: GPL-3.0-or-later
  Copyright (C) 2026 Marc Hoffmann (b14ckyy)
-->

<script lang="ts">
  // Placeholder for the Video / Split view's video pane while no stream is live: what is going on
  // (off / starting / error) plus the two ways forward — start the last source, or open the Video
  // source panel to set one up.
  import { t } from 'svelte-i18n';
  import Button from '$lib/components/panel/Button.svelte';
  import { videoState, toggleVideo } from '$lib/stores/video';

  let { onOpenSource }: { onOpenSource: () => void } = $props();

  const starting = $derived($videoState.enabled && $videoState.status === 'starting');
  const failed = $derived($videoState.enabled && $videoState.status === 'error');
</script>

<div class="ves">
  <svg class="ves-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    {#if starting}
      <path d="M12 9v3l2 1.5" />
    {:else}
      <path d="M10 9.2v5.6l4.6-2.8Z" fill="currentColor" stroke="none" />
    {/if}
  </svg>
  <div class="ves-title">
    {#if starting}{$t('dock.videoStarting')}{:else if failed}{$t('dock.videoFailed')}{:else}{$t('dock.videoNone')}{/if}
  </div>
  {#if failed && $videoState.error}
    <div class="ves-error">{$videoState.error}</div>
  {:else if !starting}
    <div class="ves-hint">{$t('dock.videoHint')}</div>
  {/if}
  <div class="ves-actions">
    {#if !starting}
      <Button variant="data" onclick={() => { if (failed) toggleVideo(); toggleVideo(); }}>
        {failed ? $t('dock.videoRetry') : $t('dock.videoStart')}
      </Button>
    {/if}
    <Button variant="standard" onclick={onOpenSource}>{$t('dock.videoSource')}</Button>
  </div>
</div>

<style>
  .ves {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 24px;
    box-sizing: border-box;
    text-align: center;
    color: #c4dad7;
    background:
      radial-gradient(ellipse at center, rgba(45, 212, 191, 0.08), transparent 60%),
      #080f10;
  }
  .ves-icon {
    width: 64px;
    height: 64px;
    color: rgba(45, 212, 191, 0.75);
  }
  .ves-title {
    font-size: 17px;
    font-weight: 600;
    color: #d8ece8;
  }
  .ves-hint,
  .ves-error {
    max-width: 420px;
    font-size: 13px;
    color: #7d9d98;
  }
  .ves-error {
    color: #ff7b72;
  }
  .ves-actions {
    display: flex;
    gap: 10px;
    margin-top: 6px;
  }
</style>
