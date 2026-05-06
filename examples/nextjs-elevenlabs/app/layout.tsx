import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Runway Avatar + ElevenLabs',
  description: 'Runway avatar powered by your ElevenLabs Conversational AI agent',
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
