
'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { useRecurringBlocks } from '@/hooks/use-recurring-blocks';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { AddEditTemplateSheet } from '@/components/templates/add-edit-template-sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RecurringBlock } from '@/lib/types';
import { cn, formatSlotTime, getContrastingTextColor } from '@/lib/utils';
import { BLOCK_COLORS } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PremiumGate } from '@/components/shared/premium-gate';

const DAY_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUGGESTED_TEMPLATES: Omit<RecurringBlock, 'id'>[] = [
  {
    title: 'Rutin Pagi',
    startTime: 7 * 6, // 7 AM
    duration: 6, // 1 hour
    color: 'orange',
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderLeadTime: 0,
  },
  {
    title: 'Kerja Fokus',
    startTime: 9 * 6, // 9 AM
    duration: 12, // 2 hours
    color: 'violet',
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderLeadTime: 0,
  },
  {
    title: 'Olahraga',
    startTime: 17 * 6, // 5 PM
    duration: 6, // 1 hour
    color: 'fuchsia',
    daysOfWeek: [1, 3, 5],
    reminderLeadTime: 0,
  },
  {
    title: 'Belajar / Membaca',
    startTime: 20 * 6, // 8 PM
    duration: 6, // 1 hour
    color: 'blue',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    reminderLeadTime: 0,
  },
  {
    title: 'Tidur Berkualitas',
    startTime: 22 * 6, // 10 PM
    duration: 48, // 8 hours
    color: 'slate',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    reminderLeadTime: 5,
  },
  {
    title: 'Waktu Hobi',
    startTime: 18 * 6, // 6 PM
    duration: 6, // 1 hour
    color: 'teal',
    daysOfWeek: [2, 4],
    reminderLeadTime: 0,
  },
];


export default function TemplatesPage() {
  const { recurringBlocks, deleteRecurringBlock } = useRecurringBlocks();
  const { settings } = useAppSettings();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<RecurringBlock | null>(null);

  const handleAddTemplateClick = () => {
    setSelectedTemplate(null);
    setSuggestionDialogOpen(true);
  };
  
  const handleCreateFromScratch = () => {
    setSelectedTemplate(null);
    setSuggestionDialogOpen(false);
    setSheetOpen(true);
  };

  const handleSelectSuggestion = (suggestion: Omit<RecurringBlock, 'id'>) => {
    const newTemplate = {
      ...suggestion,
      id: crypto.randomUUID(), // Assign a temporary ID for the form
    };
    setSelectedTemplate(newTemplate);
    setSuggestionDialogOpen(false);
    setSheetOpen(true);
  };

  const handleEditTemplate = (template: RecurringBlock) => {
    setSelectedTemplate(template);
    setSheetOpen(true);
  };

  const handleDelete = (template: RecurringBlock) => {
    deleteRecurringBlock(template.id);
  };

  return (
    <PremiumGate>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Time Templates</h1>
          <Button onClick={handleAddTemplateClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Template
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Manage your recurring time blocks here. They will automatically appear on your daily schedule.
        </p>
        
        {recurringBlocks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No Templates Yet</h3>
            <p className="text-muted-foreground mt-2">Click "Add Template" to create your first recurring block.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recurringBlocks.map((template) => {
              const isCustomColor = template.color.startsWith('#');
              const colorClasses = !isCustomColor ? (BLOCK_COLORS[template.color as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.slate) : null;
              
              return (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader className="flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription>
                        {formatSlotTime(template.startTime, template.duration, settings.timeFormat)}
                      </CardDescription>
                    </div>
                    <div 
                      className={cn(
                        "w-8 h-8",
                        settings.blockShape === 'rounded' && 'rounded-lg',
                        !isCustomColor && colorClasses?.solid
                      )}
                      style={isCustomColor ? { backgroundColor: template.color } : {}}
                    />
                  </CardHeader>
                  <CardContent className="flex-grow">
                     <div className="flex items-center gap-2">
                        {DAY_MAP.map((day, index) => {
                          const isDayActive = template.daysOfWeek.includes(index);
                          return (
                            <div 
                              key={day} 
                              style={isCustomColor && isDayActive ? { backgroundColor: template.color, color: getContrastingTextColor(template.color) } : {}}
                              className={cn(
                                "flex-1 text-center py-1.5 rounded-md text-xs font-semibold",
                                isDayActive && !isCustomColor ? `${colorClasses?.solid} ${colorClasses?.foreground}` : "bg-muted/60 text-muted-foreground"
                              )}
                            >
                              {day}
                            </div>
                          )
                        })}
                      </div>
                  </CardContent>
                  <div className="flex items-center justify-between p-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the template "{template.title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(template)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                      Edit
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={suggestionDialogOpen} onOpenChange={setSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a New Template</DialogTitle>
            <DialogDescription>
              Choose a suggestion to get started quickly, or create one from scratch.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-72">
            <div className="p-1 space-y-2">
              {SUGGESTED_TEMPLATES.map((template, index) => (
                 <button
                  key={index}
                  onClick={() => handleSelectSuggestion(template)}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-start gap-4"
                >
                  <div 
                    className={cn("p-2 mt-1 rounded-lg w-10 h-10", BLOCK_COLORS[template.color as keyof typeof BLOCK_COLORS]?.solid)}
                  />
                  <div>
                    <p className="font-semibold">{template.title}</p>
                    <p className="text-sm text-muted-foreground">A recurring block for your schedule.</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
           <Button variant="outline" onClick={handleCreateFromScratch} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create New From Scratch
            </Button>
        </DialogContent>
      </Dialog>


      <AddEditTemplateSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        template={selectedTemplate}
      />
    </PremiumGate>
  );
}
