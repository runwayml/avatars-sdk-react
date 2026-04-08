import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'External API Calling — Backend RPC',
  description: 'AI avatar that calls external APIs using backend RPC tool calls',
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
