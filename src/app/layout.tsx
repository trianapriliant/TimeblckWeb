
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { AppSettingsProvider } from '@/hooks/app-settings-provider';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TimeBlocksProvider } from '@/hooks/time-blocks-provider';
import { NotificationManager } from '@/components/notifications/notification-manager';
import { AppNotificationsProvider } from '@/hooks/app-notifications-provider';
import * as React from 'react';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { GoalsProvider } from '@/hooks/goals-provider';
import { HabitsProvider } from '@/hooks/habits-provider';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { InboxProvider } from '@/hooks/inbox-provider';
import { PageActionsProvider } from '@/hooks/page-actions-provider';
import { PomodoroProvider } from '@/hooks/pomodoro-provider';
import { MotionConfig } from 'framer-motion';
import { AchievementsProvider } from '@/hooks/achievements-provider';
import { CountdownProvider } from '@/hooks/countdown-provider';
import { AuthProvider } from '@/hooks/auth-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className={cn('font-body antialiased min-h-screen', 'font-sans')}>
       <MotionConfig reducedMotion="user">
        <AuthProvider>
          <ThemeProvider>
            <AppSettingsProvider>
              <TimeBlocksProvider>
                <AppNotificationsProvider>
                  <HabitsProvider>
                    <GoalsProvider>
                      <InboxProvider>
                        <AchievementsProvider>
                          <CountdownProvider>
                              <PomodoroProvider>
                              <PageActionsProvider>
                                  <SidebarProvider>
                                    <AppSidebar />
                                    <MobileSidebar open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen} />
                                    <SidebarInset>
                                      <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
                                      <NotificationManager />
                                      <main className="flex-1 pb-28 md:pb-0">{children}</main>
                                      <BottomNav />
                                    </SidebarInset>
                                  </SidebarProvider>
                              </PageActionsProvider>
                              </PomodoroProvider>
                          </CountdownProvider>
                        </AchievementsProvider>
                      </InboxProvider>
                    </GoalsProvider>
                  </HabitsProvider>
                </AppNotificationsProvider>
              </TimeBlocksProvider>
              <Toaster />
            </AppSettingsProvider>
          </ThemeProvider>
        </AuthProvider>
       </MotionConfig>
      </body>
    </html>
  );
}
