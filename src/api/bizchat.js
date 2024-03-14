import axios from "axios";

const BIZCHAT_BASEURL = window?.bizChatURL ?? import.meta.env.VITE_BIZCHAT_BASEURL

const bizchatAxios = axios.create({
	baseURL: BIZCHAT_BASEURL,
    withCredentials: true
})

export const sendBizchatMessage = async ({ from, recipient, message }) => {
    const { data } = await bizchatAxios.post('/api/crm_create_chat', { from, recipient, message })
    return data
}

export const getBizchatMessagesLast5 = async ({ chatId, senderUserId }) => {
    const { data } = await bizchatAxios.get(`/api/messages_last_5/${chatId}/${senderUserId}`)
    return data
}

export const getCurrentApplicantUser = async () => {
    const { data } = await bizchatAxios.post('/api/applicant/current')

    if(!data) return null

    return { ...data, applicant: true }
}

export const updateCurrentApplicantUser = async (form) => {
    const { data } = await bizchatAxios.put('/api/applicant/current', { form })
    return data
}

export const resetPasswordApplicantUser = async (new_password, resetKey) => {
    const { data } = await bizchatAxios.put('/api/applicant/reset-password', { new_password, resetKey })
    return data
}

export const forgotPasswordApplicantUser = async (email) => {
    const params = { email }
    const { data } = await bizchatAxios.get('/api/applicant/reset-password', { params })
    return data
}

export const logoutShareApplicant = async () => {
    const { data } = await bizchatAxios.post('/api/applicant/logout')
    return data
}

export const verifyShareApplicantUser = async (email, password) => {
    try {

        const { data } = await bizchatAxios.post('/api/applicant/login', { email, password })
        return data

    } catch (e) {

        return { error: "Please contact administrator. Apologies for any inconvenience." }

    }
}