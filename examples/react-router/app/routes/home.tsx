import { Link } from 'react-router';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Avatar SDK Demo</h1>
      <Link to="/avatar">Start Avatar Call</Link>
    </main>
  );
}
