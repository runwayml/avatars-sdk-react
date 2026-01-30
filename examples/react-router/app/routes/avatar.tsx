import { AvatarCall } from '@runwayml/avatar-react';
import '@runwayml/avatar-react/styles.css';

export default function AvatarPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>Avatar Demo</h1>
      <AvatarCall
        avatarId="game-host"
        connectUrl="/api/avatar/connect"
        onEnd={() => console.log('Call ended')}
        onError={console.error}
      />
    </main>
  );
}
