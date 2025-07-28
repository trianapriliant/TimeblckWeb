'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Lock, Star } from 'lucide-react';

interface PremiumGateProps {
    children: React.ReactNode;
}

export function PremiumGate({ children }: PremiumGateProps) {
    const { settings, isLoaded } = useAppSettings();

    if (!isLoaded) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-6 w-2/3" />
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (settings.isPremium) {
        return <>{children}</>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <Card className="mt-8 max-w-lg mx-auto text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                        <Lock className="h-8 w-8" />
                    </div>
                    <CardTitle>This is a Premium Feature</CardTitle>
                    <CardDescription>
                       The ability to create and manage recurring templates is available on the Premium plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/settings" passHref>
                        <Button>
                            <Star className="mr-2 h-4 w-4" />
                            Upgrade to Premium
                        </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-4">
                        You can simulate a premium account from the Settings page.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
