import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import AiChatWidget from '../components/ai/AiChatWidget';
// Mobile check import
import { headers } from 'next/headers';
import MobileComingSoon from '@/components/shared/MobileComingSoon';

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "MedBook - Healthcare Platform",
  description: "Connect with healthcare providers and manage your health journey",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mobile check
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <MobileComingSoon />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
        <AiChatWidget 
          mode="floating" 
          agentId="rag" 
          title="Ask Clinic" 
        />
      </body>
    </html>
  );
}
