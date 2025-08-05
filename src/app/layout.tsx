import { Inter } from 'next/font/google';
import BaseLayout from '@/components/layout/BaseLayout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RCIP Ready - Rural and Northern Immigration Pilot Program Assistant',
  description: 'Your AI-powered assistant for the Rural and Northern Immigration Pilot Program',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  );
}