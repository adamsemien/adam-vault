import { ReactNode } from 'react';

export const metadata = {
  title: 'Adam Vault',
  description: 'Personal Secrets Management',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>
          {`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              background-color: #0a0a0f;
              color: #e2e2e8;
              font-family: system-ui, -apple-system, sans-serif;
            }
          `}
        </style>
      </head>
      <body style={{ backgroundColor: '#0a0a0f', color: '#e2e2e8' }}>
        {children}
      </body>
    </html>
  );
}
