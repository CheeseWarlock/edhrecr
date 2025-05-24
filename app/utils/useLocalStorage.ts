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

  /**
   * Use this to store non-serializable values in localStorage.
   * Does not account for localStorage unavailability.
   * T is the type of the value to store.
   * J must be a JSON-serializable type.
   * @param key - The key to store the value under.
   * @param initialValue - The initial value to store.
   * @param serializer - A function that serializes the value to a JSON-serializable type.
   * @param deserializer - A function that deserializes the value from a JSON-serializable type.
   * @returns A tuple containing the value and a function to set the value.
   */
export const useLocalStorageWithSerializer = <T, J>(key: string, initialValue: T, serializer: (value: T) => J, deserializer: (value: J) => T) => {
    const [value, setValue] = useState<T>(() => {
        if (typeof window !== 'undefined') {
            const item = window?.localStorage?.getItem(key);
            return item ? deserializer(JSON.parse(item)) : initialValue;
        }
        return initialValue;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window?.localStorage?.setItem(key, JSON.stringify(serializer(value)));
        }
    }, [value, key, serializer]);

    return [value, setValue] as const;
}

