import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthBootstrap from '@/components/AuthBootstrap';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sa7ti - Doctor Appointment Platform',
  description: 'Book appointments with doctors easily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthBootstrap />
        {children}
      </body>
    </html>
  );
}
