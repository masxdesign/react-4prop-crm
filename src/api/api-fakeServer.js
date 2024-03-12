import delay from "@/utils/delay"
import users from "./data/fake-users.json"
import { createRandomClients, createClientObject } from "./data/fake-clients"
import localStorageController from "@/utils/localStorageController"
import { categoriesController } from "./data/fake-data"
import { createLogObject, logController } from "./data/fake-log"
import { filter } from "lodash"
import paginate from "@/utils/paginate"

const KEY_CLIENTS = 'clients.0.2.5'

export const whoisloggedin = async () => {
    const userId = localStorage.getItem('userId')
    let user = users.find((user) => user.id === (userId + ''))

    await delay(300)

    return user
}

export const login = async ({ email, password }) => {
    let user = users.find((user) => user.email === email)

    if(!user) throw new Error('Email not found')
    if(user.password !== password) throw new Error('Wrong password')

    localStorage.setItem('userId', user.id)

    await delay(900)

    return user
}

export const logout = async () => {
    localStorage.setItem('userId', null)
    await delay(100)
}

export const fetchClients = async () => {
    console.log('server call: fetchClients');
    await delay(500)
    const clients = await createRandomClients(KEY_CLIENTS, 2000)
    return clients
}

const fakePageCount = 2_000

export const fetchClientsPagin = async ({ columnFilters, sorting, pagination }) => {
    console.log('server call: fetchClientsPagin');

    const { pageIndex = 0, pageSize = 150 } = pagination

    const o = {
        count: fakePageCount,
        page: pageIndex + 1,
        perpage: pageSize
    }
    
    const data = await fetchClients()

    const pageData = paginate(data, o.perpage, o.page)

    return [o, pageData]
}

export const fetchCategories = async () => {
    console.log('server call: fetchCategories');
    await delay(500)
    return categoriesController.data
}

const clientsController = localStorageController(KEY_CLIENTS)

export const addClient = async (newItem) => {
    await delay(200)
    const savedItem = createClientObject(newItem)
    clientsController.add(savedItem)
    return savedItem
}

export const bulkInsertClient = async (rows) => {
    await delay(200)
    clientsController.bulkInsert(rows.map((row) => createClientObject(row)))
}

export const deleteClient = async (predicate) => {
    await delay(200)
    clientsController.delete(predicate)
}

export const updateClient = async (predicate, newData) => {
    await delay(200)
    clientsController.update(predicate, newData)
}

export const fetchLog = async (uid) => {
    console.log('server call: fetchLog');
    await delay(500)
    return filter(logController.data, { uid })
}

export const addLog = async (newItem) => {
    await delay(200)
    const item = createLogObject(newItem)
    logController.add(item)
    return item
}

export const deleteLog = async (id) => {
    await delay(200)
    logController.delete({ id })
}
