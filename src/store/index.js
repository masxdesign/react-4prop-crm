import { createImmer } from "@/utils/zustand-extras"
import * as fakeServer from "@/api/api-fakeServer"

export const useAuthStore = createImmer((set) => ({
    user: null,
    whoisloggedin: async () => {
        const user = await fakeServer.whoisloggedin()

        if(!user) {
            set({ user: null })
        }

        set({ user })
    },
    login: async ({ email, password }) => {
        const user = await fakeServer.login({ email, password })
        set({ user })
    },
    logout: async () => {
        await fakeServer.logout()
        set({ user: null })
    }
}))

const sortCreatedDesc = { id: 'created', desc: true }

export const useListStore = createImmer((set) => ({
    sorting: [sortCreatedDesc],
    setSorting: (sorting) => {
        set({ sorting })
    },
    sortByCreatedDesc: () => {
        set({ sorting: [sortCreatedDesc] })
    }
}))