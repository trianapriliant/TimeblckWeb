
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Star } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { useRouter } from 'next/navigation';

interface PremiumOfferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function PremiumOfferDialog({ open, onOpenChange, title, description }: PremiumOfferDialogProps) {
    const t = useTranslations();
    const router = useRouter();

    const handleUpgradeClick = () => {
        onOpenChange(false);
        router.push('/premium');
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center items-center">
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                        <Star className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-2xl">{title || t.premium_gate.title}</DialogTitle>
                    <DialogDescription className="max-w-md">
                       {description || t.premium_gate.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-4">
                    <Button size="lg" className="w-full text-base py-6" onClick={handleUpgradeClick}>
                       {t.premium_gate.upgrade_button}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
