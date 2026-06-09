import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import './globals.css';

export const metadata = {
  title: 'Adam Vault',
  description: 'Personal Secrets Management',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body {
            font-feature-settings: "cv01", "ss03";
          }
        `}</style>
      </head>
      <body
        className="min-h-dvh overflow-x-hidden"
        style={{ backgroundColor: '#08090a', color: '#f7f8f8' }}
      >
        {children}
      </body>
    </html>
  );
}
