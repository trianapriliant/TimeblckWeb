
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, BellRing, MoreHorizontal, MessageCircleQuestion, Users, Info, Twitter, Linkedin, Heart, Palette, Grip, Facebook, Youtube } from 'lucide-react';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { useTranslations } from '@/hooks/use-translations';

const InstagramIcon = (props: React.ComponentProps<'svg'>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function SettingsPage() {
  const t = useTranslations();
  const { permission, requestPermission } = useNotificationPermission();
  
  const mainSettings = [
    { 
        icon: Grip, 
        title: t.settings.navigation_title,
        description: t.settings.navigation_description,
        href: '/settings/navigation',
    },
    { 
        icon: Palette, 
        title: t.settings.appearance_title,
        description: t.settings.appearance_description,
        href: '/settings/appearance',
    },
  ];

  const moreLinks = [
    {
      href: '#',
      label: t.settings.support_development,
      icon: Heart,
    },
    {
      href: '#',
      label: t.settings.help_feedback,
      icon: MessageCircleQuestion,
    },
    {
      href: '#',
      label: t.settings.about_timeblck,
      icon: Info,
    },
  ];

  const socialLinks = [
    { href: 'https://instagram.com/timeblck', label: 'Instagram', icon: InstagramIcon },
    { href: 'https://facebook.com/timeblck', label: 'Facebook', icon: Facebook },
    { href: 'https://x.com/timeblck', label: 'X', icon: Twitter },
    { href: 'https://youtube.com/@timeblck', label: 'Youtube', icon: Youtube },
    { href: 'https://linkedin.com/company/timeblck', label: 'LinkedIn', icon: Linkedin },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t.settings.title}</h1>
      
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainSettings.map(setting => (
                <Link key={setting.href} href={setting.href} className="block hover:bg-muted/50 rounded-lg border transition-colors">
                    <Card className="h-full shadow-none border-none bg-transparent">
                      <CardHeader className="flex-row gap-4 items-start">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <setting.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{setting.title}</CardTitle>
                            <CardDescription className="text-xs mt-1">{setting.description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" /> {t.settings.notifications_title}
            </CardTitle>
            <CardDescription>
                {t.settings.notifications_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permission === 'granted' && (
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{t.settings.notifications_enabled}</p>
            )}
            {permission === 'default' && (
                <Button onClick={requestPermission}>{t.settings.notifications_button_enable}</Button>
            )}
            {permission === 'denied' && (
                <p className="text-sm text-destructive">
                    {t.settings.notifications_blocked}
                </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" /> {t.premium_gate.title}
            </CardTitle>
            <CardDescription>
              {t.premium_gate.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/premium" passHref>
                <Button>
                    <Star className="mr-2 h-4 w-4" />
                    {t.premium_gate.upgrade_button}
                </Button>
             </Link>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-2">Join the Community</h2>
                        <p className="text-muted-foreground mb-6">
                            Support development, give feedback, and stay up to date with the latest news.
                        </p>
                         <div className="space-y-2 mb-6">
                            {moreLinks.map((link) => (
                                <Button key={link.label} variant="outline" className="w-full justify-start" asChild>
                                    <Link
                                        href={link.href}
                                        target={link.href.startsWith('http') ? '_blank' : undefined}
                                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    >
                                        <link.icon className="mr-2 h-4 w-4" />
                                        {link.label}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            {socialLinks.map((link) => (
                                <Button key={link.label} variant="outline" size="icon" asChild>
                                    <Link
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.label}
                                    >
                                        <link.icon className="h-5 w-5" />
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-muted/50 hidden md:flex items-center justify-center p-6">
                        <Image 
                            src="https://placehold.co/600x400.png"
                            width={600}
                            height={400}
                            alt="Timeblck app showcase"
                            className="rounded-lg shadow-2xl object-cover"
                            data-ai-hint="productivity app schedule"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
