import type {Metadata, Viewport} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shaadi Squad — Har kaam, sahi insaan, sahi waqt',
  description: 'Real-time Wedding Team Management & Work Assignment App.',
  openGraph: {
    title: 'Shaadi Squad — Har kaam, sahi insaan, sahi waqt',
    description: 'Real-time Wedding Team Management & Work Assignment App.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shaadi Squad — Har kaam, sahi insaan, sahi waqt',
    description: 'Real-time Wedding Team Management & Work Assignment App.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FAF7F2',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-[#F8F5F0] text-[#1E1B18] antialiased selection:bg-[#E8DCC8] selection:text-[#4A3828] min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
