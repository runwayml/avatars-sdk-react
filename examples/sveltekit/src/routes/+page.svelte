<script lang="ts">
  import { streamTo, AvatarEvent, type AvatarSession } from '@runwayml/avatars';

  let session: AvatarSession | null = $state(null);
  let status = $state('Ready');
  let micEnabled = $state(false);
  let avatarEl: HTMLVideoElement;
  let webcamEl: HTMLVideoElement;

  async function start() {
    status = 'Connecting...';

    const res = await fetch('/api/avatar/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarId: 'influencer' }),
    });
    const credentials = await res.json();

    session = await streamTo({ credentials, target: avatarEl });

    if (session.localVideoTrack) {
      webcamEl.srcObject = new MediaStream([session.localVideoTrack]);
    }
    session.on(AvatarEvent.LocalVideoReady, (track) => {
      webcamEl.srcObject = new MediaStream([track]);
    });

    session.on(AvatarEvent.AvatarVideoReady, () => {
      status = 'Connected — start talking!';
    });

    session.on(AvatarEvent.MediaChanged, () => {
      micEnabled = session?.mic.isEnabled ?? false;
    });

    session.on(AvatarEvent.Error, (err) => {
      status = `Error: ${err.message}`;
    });

    micEnabled = session.mic.isEnabled;
  }

  function toggleMic() {
    session?.mic.toggle();
  }

  function end() {
    session?.end();
    session = null;
    webcamEl.srcObject = null;
    status = 'Ended';
    micEnabled = false;
  }
</script>

<main>
  <h1>Runway Avatar — SvelteKit</h1>

  <div class="video-grid">
    <video bind:this={avatarEl} autoplay playsinline></video>
    <video bind:this={webcamEl} autoplay playsinline muted class="webcam"></video>
  </div>

  <div class="controls">
    <button onclick={start} disabled={session !== null}>Start</button>
    <button onclick={toggleMic} disabled={!session} class:muted={!micEnabled}>
      {micEnabled ? 'Mute' : 'Unmute'}
    </button>
    <button onclick={end} disabled={!session} class="end">End call</button>
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

  .video-grid {
    position: relative;
    width: 100%;
  }

  video {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 16px;
    background: #1a1a1a;
    object-fit: cover;
  }

  .webcam {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 25%;
    border-radius: 10px;
    background: #222;
    transform: scaleX(-1);
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
    transition: all 0.15s ease;
  }

  button:disabled {
    opacity: 0.3;
    cursor: default;
  }

  button.muted {
    background: #fee;
    border-color: #e88;
  }

  button.end {
    border-color: #e88;
    color: #c44;
  }

  .status {
    font-size: 0.75rem;
    color: #888;
  }
</style>
