import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Runway Avatar SDK</h1>
      <p>A headless React component library for real-time avatars.</p>
      <Link href="/avatar">Start Avatar Call →</Link>
    </main>
  );
}
