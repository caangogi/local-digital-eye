
"use client";

import { useState, useEffect } from 'react';

/**
 * This component acts as a client boundary.
 * It ensures that its children are only rendered on the client side,
 * preventing hydration mismatches caused by browser extensions that modify the DOM.
 */
export function ClientAuthForm({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // You can return a loader here if you want
        return null;
    }

    return <>{children}</>;
}
