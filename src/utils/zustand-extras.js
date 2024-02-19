import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import createSelectors from "./createSelectors"

export const createImmer = (initializer) => createSelectors(create(immer(initializer)))