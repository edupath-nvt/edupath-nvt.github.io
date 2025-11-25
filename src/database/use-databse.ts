import dayjs from "dayjs";
import SparkMD5 from "spark-md5";
import { create } from "zustand";
import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks";

import { API } from "src/api/axios";
import { useAuth } from "src/store/auth";

import { db } from "./dexie";

type TypeDataBase = { list: TargetDatabase[], setList: (list: TargetDatabase[]) => void, current: number, setCurrent: (current: number) => void }

export const useDatabase = create<TypeDataBase>((set) => ({
    list: [],
    setList: (list) => set({ list }),
    current: Number(localStorage.getItem('id_target') || '0'),
    setCurrent: (current) => {
        set({ current })
        localStorage.setItem('id_target', String(current))
    },
}))

export const useCreateDatabase = () => {
    const { current } = useDatabase();
    const { auth } = useAuth();
    const [targetSer, setTargetSer] = useState<TargetDatabase>()
    const { md5, target: _target, count } = useLiveQuery(async () => {
        const json = {
            targets: await db.targets.toArray(),
            scores: await db.scores.toArray(),
            schedules: await db.schedules.toArray(),
        }
        const _md5 = SparkMD5.hash(JSON.stringify(json))
        localStorage.setItem('md5', _md5)
        return { md5: _md5, target: json, count: await db.targets.count() }
    }, []) || { md5: '', target: { targets: [], scores: [], schedules: [] } }

    useEffect(() => {
        if (current && auth && auth.id) {
            API.getTarget(current).then((target) => {
                setTargetSer(target)
                if (target.md5 !== localStorage.getItem('md5') && target.time >= Number(localStorage.getItem('time') || '0')) {
                    db.targets.clear()
                    db.scores.clear()
                    db.schedules.clear()
                    db.targets.bulkAdd(target.target.targets)
                    db.scores.bulkAdd(target.target.scores)
                    db.schedules.bulkAdd(target.target.schedules)
                }
            }).catch(() => {
                localStorage.removeItem('id_target')
                localStorage.removeItem('md5')
                localStorage.removeItem('time')
                db.targets.clear()
                db.scores.clear()
                db.schedules.clear()
            })
        }
    }, [auth, current])


    useEffect(() => {
        if (md5 && targetSer && md5 !== targetSer.md5 && count) {
            const time = dayjs().unix()
            localStorage.setItem('time', String(time))
            API.asyncTarget({ ...targetSer, target: _target, md5, time }).then(() => setTargetSer({ ...targetSer, md5 }))
        }
    }, [_target, count, md5, targetSer])
}