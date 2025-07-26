
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Check } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { usePageActions } from '@/hooks/page-actions-provider';


export default function PremiumPage() {
    const t = useTranslations();
    const { user } = useAuth();
    const router = useRouter();
    const { setPageActions } = usePageActions();

    const [plan, setPlan] = React.useState('yearly');

    React.useEffect(() => {
        setPageActions({
            title: 'Timeblck Premium',
            description: t.premium_gate.description,
        });
        return () => setPageActions(null);
    }, [setPageActions, t]);


    const handleCheckout = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        // TODO: Implement Stripe Checkout Logic
        console.log(`Starting checkout for ${plan} plan for user ${user.uid}`);
    };

    const plans = {
        monthly: { price: 'Rp.25rb', period: t.premium_gate.price_per_month, note: '' },
        yearly: { price: 'Rp.250rb', period: t.premium_gate.price_per_year, note: t.premium_gate.billed_annually },
        lifetime: { price: 'Rp.499rb', period: '', note: t.premium_gate.one_time_payment },
    };

    const selectedPlan = plans[plan as keyof typeof plans];

    return (
        <div className="container mx-auto p-4 md:p-6">
            <Card className="mt-8 max-w-2xl mx-auto">
                <CardHeader className="text-center items-center">
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                        <Star className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl">{t.premium_gate.title}</CardTitle>
                    <CardDescription className="max-w-md">
                       {t.premium_gate.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <ToggleGroup
                        type="single"
                        defaultValue="yearly"
                        value={plan}
                        onValueChange={(value) => { if (value) setPlan(value) }}
                        className="justify-center mb-4"
                    >
                        <ToggleGroupItem value="monthly" aria-label={t.premium_gate.monthly}>
                            {t.premium_gate.monthly}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="yearly" aria-label={t.premium_gate.yearly} className="relative">
                            {t.premium_gate.yearly}
                            <div className="absolute -top-2 right-0 text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                                {t.premium_gate.yearly_save}
                            </div>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="lifetime" aria-label={t.premium_gate.lifetime}>
                            {t.premium_gate.lifetime}
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <div className="my-6">
                        <span className="text-5xl font-bold">{selectedPlan.price}</span>
                        <span className="text-muted-foreground">{selectedPlan.period}</span>
                        <p className="text-sm text-muted-foreground mt-1">{selectedPlan.note}</p>
                    </div>

                    <div className="text-left bg-muted/50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-4">{t.premium_gate.features_title}</h3>
                        <ul className="space-y-3">
                            {[
                                t.premium_gate.feature_templates,
                                t.premium_gate.feature_custom_start,
                                t.premium_gate.feature_custom_colors,
                                t.premium_gate.feature_advanced_reports,
                                t.premium_gate.feature_ai
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Button size="lg" className="w-full mt-8 text-lg py-6" onClick={handleCheckout}>
                       {user ? t.premium_gate.upgrade_button : 'Login to Upgrade'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

