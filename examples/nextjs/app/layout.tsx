import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Runway Avatar SDK',
  description: 'Build real-time avatar experiences with React',
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
