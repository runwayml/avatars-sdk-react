import { AvatarCall } from '@runwayml/avatar-react';
import '@runwayml/avatar-react/styles.css';

export default function AvatarPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>Avatar Demo</h1>
      <AvatarCall
        avatarId="your_avatar_id"
        connectUrl="/api/avatar/connect"
        onEnd={() => console.log('Call ended')}
        onError={(err: Error) => console.error('Error:', err)}
      />
    </main>
  );
}
