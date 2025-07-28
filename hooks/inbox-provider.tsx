
'use client';

import * as React from 'react';
import { useInboxState } from './use-inbox-items';
import type { InboxItem } from '@/lib/types';

interface InboxContextValue {
  items: InboxItem[];
  addItem: (data: Omit<InboxItem, 'id' | 'createdAt' | 'isCompleted'>) => InboxItem;
  updateItem: (id: string, data: Partial<Omit<InboxItem, 'id' | 'createdAt'>>) => void;
  deleteItem: (id: string) => void;
  toggleItemCompletion: (id: string) => void;
  isLoaded: boolean;
}

const InboxContext = React.createContext<InboxContextValue | undefined>(undefined);

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const inboxState = useInboxState();

  return (
    <InboxContext.Provider value={inboxState}>
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  const context = React.useContext(InboxContext);
  if (context === undefined) {
    throw new Error('useInbox must be used within an InboxProvider');
  }
  return context;
}
