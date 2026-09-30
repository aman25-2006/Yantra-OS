import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YantraOS — AI Industrial Copilot & Predictive Monitoring',
  description: 'Predictive maintenance and edge telemetry intelligence platform for MSME manufacturing plants.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-industrial-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
