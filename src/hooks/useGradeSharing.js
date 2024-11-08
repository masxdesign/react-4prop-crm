import { decodeFromBinary } from "@/utils/binary"
import { createImmer } from "@/utils/zustand-extras"
import { pick } from "lodash"
import { useShallow } from 'zustand/react/shallow'

export const useGradeSharingStore = createImmer((set, get) => ({
    tag: null,
    openedPid: null,
    openedGrade: null,
    selected: null,
    pidGrades: [],
    setFromBin: bin => {

        const [selectedId, selectedEmail, tagId, tagName] = JSON.parse(decodeFromBinary(bin))

        set(state => {
            state.tag = {
                id: tagId,
                name: tagName
            }
            state.selected = {
                id: selectedId,
                email: selectedEmail
            }
        })

    },
    setOpenedProperty: (grade, pid) => set({ openedPid: pid, openedGrade: grade }),
    setTag: tag => set({ tag }),
    setInfo: info => {

        set(state => {
            state.tag = {
                id: info.to.tagId,
                name: info.to.tagName
            }
            state.selected = {
                id: info.to.selectedId,
                email: info.to.email
            }
            state.pidGrades = info.selectedList
        })
    
    },
    setOpenedGrade: openedGrade => set({ openedGrade }),
    setSelected: selected => set({ selected }),
    removePidGrade: pid => {

        const index = get().pidGrades.findIndex(item => item.pid === pid)

        if (index < 0) return
            
        set(state => {
            state.pidGrades.splice(index, 1)
        })

    },
    upsertPidGrade: (pid, grade) => {

        const index = get().pidGrades.findIndex(item => item.pid === pid)

        if(index < 0) {
            set(state => {
                state.pidGrades.push({ grade, pid })
            })
            return
        }
        set(state => {
            state.pidGrades[index].grade = grade
        })

    }
}))


export function useGradeSharingInfoSelector () {
    return useGradeSharingStore(
        useShallow(state => pick(state, ['tag', 'selected', 'pidGrades']))
    )
}