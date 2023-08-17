import { useEffect, useState } from "react";

export const useStorageState = <T>(
    key: string,
    defaultValue: T
): [value: T, isLoading: boolean, setValue: (newValue: T) => void] => {
    const [localValue, setLocalValue] = useState<T>(defaultValue);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        chrome.storage.local.get(key).then((res) => {
            setIsLoading(false);
            if (res[key]) {
                setLocalValue(res[key]);
            }
        });

        const listener = (
            changes: Record<string, chrome.storage.StorageChange>
        ) => {
            if (changes[key]) {
                setLocalValue(changes[key].newValue || {});
            }
        };

        chrome.storage.local.onChanged.addListener(listener);

        return () => chrome.storage.local.onChanged.removeListener(listener);
    }, []);

    const setValue = async (newValue: T) => {
        await chrome.storage.local.set({ [key]: newValue });
    };

    return [localValue, isLoading, setValue];
};
