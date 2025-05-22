'use client';

import { useEffect, useState } from "react"

export const useLocalStorage = <T>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
        if (typeof window !== 'undefined') {
            const item = window?.localStorage?.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        return initialValue;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window?.localStorage?.setItem(key, JSON.stringify(value));
        }
    }, [value, key]);

    return [value, setValue] as const;
}   
