import { createContext, useContext } from "react";

export const ClientformContext = createContext(null)

export const useClientformContext = () => useContext(ClientformContext)