import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Kunddan Home Foods',
  description: 'Homemade food products, pickles, powders, and mixes e-commerce platform.',
  openGraph: {
    title: 'Kunddan Home Foods',
    description: 'Homemade food products, pickles, powders, and mixes e-commerce platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kunddan Home Foods',
    description: 'Homemade food products, pickles, powders, and mixes e-commerce platform.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
