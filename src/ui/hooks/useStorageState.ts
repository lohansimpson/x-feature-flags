import { useEffect, useState } from "react";

export const useStorageState = <T>(
    key: string,
    defaultValue: T
): [value: T, setValue: (newValue: T) => void] => {
    const [localValue, setLocalValue] = useState<T>(defaultValue);

    useEffect(() => {
        chrome.storage.local.get(key).then((res) => {
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

    return [localValue, setValue];
};
