import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import Sidebar from '@/components/nav/Sidebar';
import TopBar from '@/components/nav/TopBar';
import SystemMetricsBar from '@/components/nav/SystemMetricsBar';
import ChatWidget from '@/components/chat/ChatWidget';
import { initializeScheduler } from '@/lib/jobs/scheduler';

initializeScheduler();

export const metadata: Metadata = {
  title: 'OpenClaw Dashboard',
  description: 'Mission Control for AI agent fleets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text-primary antialiased">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <TopBar />
              <SystemMetricsBar />
              <main className="relative flex-1 overflow-auto">{children}</main>
              <ChatWidget />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
