'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CursorContextType {
    cursorText: string;
    setCursorText: (text: string) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: ReactNode }) {
    const [cursorText, setCursorText] = useState("");

    return (
        <CursorContext.Provider value={{ cursorText, setCursorText }}>
            {children}
        </CursorContext.Provider>
    );
}

export function useCursor() {
    const context = useContext(CursorContext);
    if (context === undefined) {
        throw new Error('useCursor must be used within a CursorProvider');
    }
    return context;
}
