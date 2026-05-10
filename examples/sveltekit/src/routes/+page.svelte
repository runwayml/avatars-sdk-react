<script lang="ts">
  import { streamTo, AvatarEvent, type AvatarSession } from '@runwayml/avatars';

  let session: AvatarSession | null = $state(null);
  let status = $state('Ready');
  let videoEl: HTMLVideoElement;

  async function start() {
    status = 'Connecting...';

    const res = await fetch('/api/avatar/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarId: 'influencer' }),
    });
    const credentials = await res.json();

    session = await streamTo({ credentials, target: videoEl });

    session.on(AvatarEvent.AvatarVideoReady, () => {
      status = 'Connected — start talking!';
    });

    session.on(AvatarEvent.Error, (err) => {
      status = `Error: ${err.message}`;
    });
  }

  function end() {
    session?.end();
    session = null;
    status = 'Ended';
  }
</script>

<main>
  <h1>Runway Avatar — SvelteKit</h1>

  <video bind:this={videoEl} autoplay playsinline></video>

  <div class="controls">
    <button onclick={start} disabled={session !== null}>Start</button>
    <button onclick={() => session?.mic.toggle()} disabled={!session}>
      Toggle mic
    </button>
    <button onclick={end} disabled={!session}>End call</button>
  </div>

  <p class="status">{status}</p>
</main>

<style>
  main {
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 520px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  h1 {
    font-size: 1.25rem;
    font-weight: 500;
  }

  video {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 16px;
    background: #1a1a1a;
    object-fit: cover;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }

  button {
    font-family: inherit;
    font-size: 0.8125rem;
    padding: 0.5rem 1.25rem;
    border-radius: 100px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .status {
    font-size: 0.75rem;
    color: #888;
  }
</style>
