
'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { useInbox } from '@/hooks/inbox-provider';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { EisenhowerQuadrant } from '@/components/matrix/eisenhower-quadrant';
import { AddEditItemSheet } from '@/components/inbox/add-edit-item-sheet';
import type { InboxItem, EisenhowerQuadrant as QuadrantType } from '@/lib/types';
import { usePageActions } from '@/hooks/page-actions-provider';

export default function MatrixPage() {
    const t = useTranslations();
    const { items, isLoaded } = useInbox();
    const { setPageActions } = usePageActions();

    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<InboxItem | null>(null);

    const handleAddItem = React.useCallback(() => {
        setSelectedItem(null);
        setSheetOpen(true);
    }, []);

    React.useEffect(() => {
        const fabAction = {
            label: t.matrix.add_task,
            action: handleAddItem
        };

        setPageActions({
            title: t.nav.matrix,
            description: t.matrix.description,
            fab: fabAction,
        });

        return () => setPageActions(null);
    }, [setPageActions, t, handleAddItem]);

    const handleEditItem = (item: InboxItem) => {
        setSelectedItem(item);
        setSheetOpen(true);
    };

    const quadrants = React.useMemo(() => {
        const q: Record<QuadrantType, InboxItem[]> = {
            URGENT_IMPORTANT: [],
            NOT_URGENT_IMPORTANT: [],
            URGENT_NOT_IMPORTANT: [],
            NOT_URGENT_NOT_IMPORTANT: [],
        };
        if (isLoaded) {
            items.forEach(item => {
                if (item.quadrant) {
                    q[item.quadrant].push(item);
                }
            });
        }
        return q;
    }, [items, isLoaded]);
    
    return (
        <div className="container mx-auto p-4 md:p-6 flex flex-col h-full">
            <div className="grid grid-cols-2 gap-2 flex-1">
                <EisenhowerQuadrant
                    title={t.matrix.urgent_important}
                    description={t.matrix.urgent_important_desc}
                    items={quadrants.URGENT_IMPORTANT}
                    onEditItem={handleEditItem}
                    quadrant="URGENT_IMPORTANT"
                    color="hsl(var(--destructive))"
                />
                <EisenhowerQuadrant
                    title={t.matrix.not_urgent_important}
                    description={t.matrix.not_urgent_important_desc}
                    items={quadrants.NOT_URGENT_IMPORTANT}
                    onEditItem={handleEditItem}
                    quadrant="NOT_URGENT_IMPORTANT"
                    color="hsl(var(--chart-2))"
                />
                <EisenhowerQuadrant
                    title={t.matrix.urgent_not_important}
                    description={t.matrix.urgent_not_important_desc}
                    items={quadrants.URGENT_NOT_IMPORTANT}
                    onEditItem={handleEditItem}
                    quadrant="URGENT_NOT_IMPORTANT"
                    color="hsl(var(--chart-3))"
                />
                <EisenhowerQuadrant
                    title={t.matrix.not_urgent_not_important}
                    description={t.matrix.not_urgent_not_important_desc}
                    items={quadrants.NOT_URGENT_NOT_IMPORTANT}
                    onEditItem={handleEditItem}
                    quadrant="NOT_URGENT_NOT_IMPORTANT"
                    color="hsl(var(--muted-foreground))"
                />
            </div>
            <AddEditItemSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                item={selectedItem}
                source="matrix"
            />
        </div>
    );
}
