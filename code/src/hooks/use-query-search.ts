import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function useQuerySearch<T extends Record<string, any>>(props: T) {
    const [search, setSearch] = useSearchParams();
    const params = useMemo(() => Object.fromEntries(Object.entries(props).map(([key, value]) => {
        const raw = search.get(key);
        const parsed =
            raw !== null
                ? (typeof value === 'number'
                    ? Number(raw)
                    : typeof value === 'boolean'
                        ? raw === 'true'
                        : (raw as typeof value))
                : value;

        return [key, parsed] as [keyof typeof props, typeof value];
    })) as T, [props, search]);
    const setParms = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setSearch((prev) => {
            if (props[key] !== value) prev.delete(key as string);
            else prev.set(key as string, (value as any).toString());

            return prev;
        }, { replace: true });
    }, [props, setSearch]);

    return [
        params,
        setParms,
    ] as const

}