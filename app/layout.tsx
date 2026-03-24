import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Nation Explorer',
  description: 'Interactive geopolitical intelligence platform. Explore in-depth profiles of every country — economy, defense, energy, politics and more.',
  metadataBase: new URL('https://nationexplorer.com'),
  openGraph: {
    title: 'Nation Explorer',
    description: 'Interactive geopolitical intelligence platform. Explore in-depth profiles of every country — economy, defense, energy, politics and more.',
    url: 'https://nationexplorer.com',
    siteName: 'Nation Explorer',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Nation Explorer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nation Explorer',
    description: 'Interactive geopolitical intelligence platform. Explore in-depth profiles of every country.',
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen bg-slate-950 text-slate-200 font-sans">
        {children}
        <GoogleAnalytics gaId="G-QNS3D3ZSZS" />
      </body>
    </html>
  );
}
