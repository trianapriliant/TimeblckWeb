
'use client';

import * as React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { useTranslations } from '@/hooks/use-translations';
import { allNavItems, type NavItem } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { GripVertical, Lock, Home, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { NavId, BottomNavPairs } from '@/lib/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function SortableItem({ id, item }: { id: NavId; item: NavItem }) {
  const t = useTranslations();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isLocked = item.id === 'home';
  const label = t.nav[item.labelKey];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border bg-background",
        isLocked && "bg-muted/50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3">
        {isLocked ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab h-8 w-8"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
        <item.icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}

function PairSelector({ slotKey, value, onChange }: { slotKey: keyof BottomNavPairs; value: [NavId, NavId]; onChange: (slotKey: keyof BottomNavPairs, index: 0 | 1, navId: NavId) => void }) {
  const t = useTranslations();

  const handleSelectChange = (index: 0 | 1, navId: NavId) => {
    onChange(slotKey, index, navId);
  };
  
  const navItem1 = allNavItems.find(item => item.id === value[0]);
  const navItem2 = allNavItems.find(item => item.id === value[1]);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="flex items-center gap-4">
            {navItem1 && <navItem1.icon className="h-5 w-5 text-muted-foreground" />}
            <Select value={value[0]} onValueChange={(val) => handleSelectChange(0, val as NavId)}>
                <SelectTrigger className="w-40">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {allNavItems.map(item => <SelectItem key={item.id} value={item.id}>{t.nav[item.labelKey]}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
         <div className="flex items-center gap-4">
            {navItem2 && <navItem2.icon className="h-5 w-5 text-muted-foreground" />}
            <Select value={value[1]} onValueChange={(val) => handleSelectChange(1, val as NavId)}>
                <SelectTrigger className="w-40">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {allNavItems.map(item => <SelectItem key={item.id} value={item.id}>{t.nav[item.labelKey]}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    </div>
  )
}

export default function NavigationSettingsPage() {
  const { settings, updateSettings, isLoaded } = useAppSettings();
  const t = useTranslations();
  const sensors = useSensors(useSensor(PointerSensor));

  const sidebarItems = React.useMemo(() => {
    if (!isLoaded) return [];
    return settings.navigationItems.map(id => allNavItems.find(item => item.id === id)).filter(Boolean) as NavItem[];
  }, [settings.navigationItems, isLoaded]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sidebarItems.findIndex(item => item.id === active.id);
      const newIndex = sidebarItems.findIndex(item => item.id === over.id);
      
      if (oldIndex === 0 || newIndex === 0) return;
      
      const newOrder = arrayMove(sidebarItems, oldIndex, newIndex);
      updateSettings({ navigationItems: newOrder.map(item => item.id) });
    }
  };

  const handlePairChange = (slotKey: keyof BottomNavPairs, index: 0 | 1, navId: NavId) => {
    const newPairs = { ...settings.bottomNavPairs };
    newPairs[slotKey][index] = navId;
    updateSettings({ bottomNavPairs: newPairs });
  };


  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{t.navigation_settings.title}</h1>
      <p className="text-muted-foreground mb-6">
        {t.navigation_settings.description}
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.navigation_settings.desktop_sidebar}</CardTitle>
            <CardDescription>{t.navigation_settings.drag_to_reorder}</CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sidebarItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {sidebarItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <SortableItem id={item.id} item={item} />
                    </React.Fragment>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
            <CardTitle>{t.navigation_settings.mobile_bottom_bar}</CardTitle>
            <CardDescription>{t.navigation_settings.mobile_bottom_bar_pairs}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border bg-muted/50">
                  <Label className="font-medium text-muted-foreground">Slot 1 (Locked)</Label>
                  <div className="flex items-center justify-between text-sm mt-2 text-foreground/80 font-medium">
                      <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          <span>{t.nav.home}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Inbox className="h-4 w-4" />
                          <span>{t.nav.inbox}</span>
                      </div>
                  </div>
              </div>
              {isLoaded && Object.keys(settings.bottomNavPairs).map((key, i) => (
                  <div key={key} className="space-y-2">
                    <Label className="font-medium text-muted-foreground">Slot {i + 2}</Label>
                    <PairSelector 
                        slotKey={key as keyof BottomNavPairs}
                        value={settings.bottomNavPairs[key as keyof BottomNavPairs]}
                        onChange={handlePairChange}
                    />
                  </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
