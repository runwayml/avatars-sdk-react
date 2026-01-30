import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avatar Demo',
  description: 'Runway Avatar SDK Demo',
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
