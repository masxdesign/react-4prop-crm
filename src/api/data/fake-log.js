import { v4 as uuidv4 } from 'uuid'
import localStorageController from "@/utils/localStorageController"

const key = 'log.0.0.1'

const initialState = []

export const logController = localStorageController(key, initialState)

export const createLogObject = (newData = null) => ({
    id: uuidv4(),
    uid: null,
    author: null,
    message: null,
    created: `${new Date()}`,
    isJSON: false,
    ...newData
})