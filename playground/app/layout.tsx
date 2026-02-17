import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Runway Avatar Playground',
  description: 'Try the Runway Avatar SDK with your own API key',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
