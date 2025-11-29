import { create } from "zustand";

import type { Message } from "./page";

export const useMessages = create<{ msg: Message, setMsg: React.Dispatch<React.SetStateAction<Message>> }>((set) => ({
    msg: [],
    setMsg: (msg: Message | ((pre: Message) => Message)) => {
        if (Array.isArray(msg)) {
            set({ msg })
        } else {
            set((pre) => ({ msg: msg(pre.msg) }))
        }
    }
}))