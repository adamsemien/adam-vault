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
      <body className="bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
