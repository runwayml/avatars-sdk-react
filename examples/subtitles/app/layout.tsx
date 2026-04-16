import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Subtitles — Runway Avatar SDK',
  description: 'Live transcription overlay during avatar conversations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://d3phaj0sisr2ct.cloudfront.net"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://runway-static-assets.s3.us-east-1.amazonaws.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
