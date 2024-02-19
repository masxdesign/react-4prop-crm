import localStorageController from "@/utils/localStorageController"

const key = "categories.0.1.0"

export const initialCategories = [
    {
        value: "1",
        label: "4Prop"
    },
    {
        value: "2",
        label: "EACH"
    },
    {
        value: "3",
        label: "Potential"
    },
    {
        value: "4",
        label: "My list"
    },
    {
        value: "5",
        label: "Imported"
    },
]

export const categoriesController = localStorageController(key, initialCategories)