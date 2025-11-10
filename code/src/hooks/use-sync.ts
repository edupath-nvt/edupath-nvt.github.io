import { useState, useEffect } from "react";

export function useSync<T>(fn: () => Promise<T>, def?: T): T | undefined {
    const [rs, setRs] = useState<T | undefined>(def)
    useEffect(() => {
        fn().then(setRs)
    }, [fn])
    return rs ?? def
}