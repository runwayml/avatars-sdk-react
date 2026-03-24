import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Avatar Trivia — RPC + Client Events',
  description: 'AI avatar hosts a trivia game using backend RPC for questions and client events for UI',
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
