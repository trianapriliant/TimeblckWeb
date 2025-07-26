
'use client';

import * as React from 'react';

interface PageActions {
    title?: string;
    description?: string;
    dropdown?: React.ReactNode;
    fab?: {
        label: string;
        action: () => void;
    }
}

interface PageActionsContextValue {
    pageActions: PageActions | null;
    setPageActions: React.Dispatch<React.SetStateAction<PageActions | null>>;
}

const PageActionsContext = React.createContext<PageActionsContextValue | undefined>(undefined);

export function PageActionsProvider({ children }: { children: React.ReactNode }) {
    const [pageActions, setPageActions] = React.useState<PageActions | null>(null);

    const value = React.useMemo(() => ({
        pageActions,
        setPageActions,
    }), [pageActions]);

    return (
        <PageActionsContext.Provider value={value}>
            {children}
        </PageActionsContext.Provider>
    );
}

export function usePageActions() {
    const context = React.useContext(PageActionsContext);
    if (context === undefined) {
        throw new Error('usePageActions must be used within a PageActionsProvider');
    }
    return context;
}
