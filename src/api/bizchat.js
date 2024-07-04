import axios from "axios";

const BIZCHAT_BASEURL = window?.bizChatURL ?? import.meta.env.VITE_BIZCHAT_BASEURL

const bizchatAxios = axios.create({
	baseURL: BIZCHAT_BASEURL,
    withCredentials: true
})

export const sendMassBizchat = async ({ from, recipients, subjectLine, message }) => {
    const { data } = await bizchatAxios.post('/api/crm/send_mass', { from, recipients, subjectLine, message })
    return data
}

export const getMassBizchatList = async ({ from }) => {
    const { data } = await bizchatAxios.get(`/api/crm/mass_list/${from}`)
    return data
}

export const getMassBizchatStat = async ({ from }) => {
    const { data } = await bizchatAxios.get(`/api/crm/mass_stat/${from}`)
    return data
}

export const getMassBizchatNotEmailed = async ({ crm_id }) => {
    const { data } = await bizchatAxios.get(`/api/crm/mass_not_emailed/${crm_id}`)
    return data
}

export const sendBizchatMessage = async ({ from, recipient, message, context }) => {
    const { data } = await bizchatAxios.post('/api/crm/create_chat', { from, recipient, message, context })
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

export const getEnquiryRoomAsync = async (userId, type, i) => {
	const params = { createdBy: userId, type, i }
	const { data } = await bizchatAxios.get(`/api/enquiry_room`, { params, withCredentials: true })
	return data
}

export const addEnquiryRoomAsync = async (name, userId, type, i, tab) => {
	const { data } = await bizchatAxios.post(`/api/enquiry_room`, { name, createdBy: userId, type, i, tab }, { withCredentials: true })
	return data
}

export const uploadAttachmentsAsync = async (formDataOrBody, config = {}) => {
	const { data } = await bizchatAxios.post(`/api/attachments`, formDataOrBody, { withCredentials: true, ...config })
    return data
}

export const sendBizchatPropertyEnquiry = async ({ userId, form, attachments = [] }) => {
	if (import.meta.env.DEV) return 

    let enquiryRoom = await getEnquiryRoomAsync(userId, "P", form.property.id)

    if (!enquiryRoom) {
        enquiryRoom = await addEnquiryRoomAsync(form.property.title, userId, "P", form.property.id, 'E')
    }

    return uploadAttachmentsAsync({
        message: createEnquiryPropertyMessageDataObject(userId, enquiryRoom, form, attachments),
        context: createPropertyEnquiryContextObject(enquiryRoom, form.property)
    })
}

function createPropertyEnquiryContextObject (enquiryRoom, property) {
	const { id, sizeText, tenureText, title, content, thumbnail } = property

	return { 
		chatName: enquiryRoom.name, 
		chatType: "P", 
		broadcastSender: true, 
		forceNotifyNewMessage: true,
		enquiry: {
			properties: [
				{
					pid: id,
					title, 
					teaser: content.teaser,
					thumb: thumbnail?.replace(/^https:\/\/4prop.com/, ''),
					sizeText, 
					tenureText
				}
			]
		}
	}
}

function createEnquiryPropertyMessageDataObject (userId, enquiryRoom, form, attachments= []) {
    const { viewing, pdf, message, property } = form
    
    if (property.agents.length < 1) throw new Error("property.agents empty")

	let choices = 0

	if(viewing) {
		choices = choices | 1
    }

	if(pdf) {
		choices = choices | 2
    }

	return { 
		from: userId, 
		body: message, 
		recipients: `${property.agents}`,
		chat_id: enquiryRoom.id,
		choices,
		type: attachments.length > 0 ? 'A': 'M'
	}
}