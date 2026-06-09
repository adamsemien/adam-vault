import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Adam Vault',
  description: 'Personal Secrets Management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: '#080809', color: '#ededef' }}>
        {children}
      </body>
    </html>
  );
}
