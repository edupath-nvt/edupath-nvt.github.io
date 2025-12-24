import { create } from "zustand";

import type { TargetData } from "../utils/get-score";

export type ListTargetStore = {
    targetList: TargetData[];
    setTargetList: (list: TargetData[]) => void;
}

export const useListTarget = create<ListTargetStore>((set) => ({
    targetList: [] as TargetData[],
    setTargetList: (list: TargetData[]) => set({ targetList: list })
}))