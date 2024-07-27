import delay from "@/utils/delay";
import skaler from "@/utils/skaler";
import axios from "axios";
import { nanoid } from "nanoid";

const BIZCHAT_BASEURL = window?.bizChatURL ?? import.meta.env.VITE_BIZCHAT_BASEURL

const bizchatAxios = axios.create({
	baseURL: BIZCHAT_BASEURL,
    withCredentials: true
})

export const sendMassBizchat = async ({ from, recipients, subjectLine, message }) => {
    const { data } = await bizchatAxios.post('/api/crm/send_mass', { from, recipients, subjectLine, message })
    await delay(1000)
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

export const getListUnreadTotal = async ({ from, recipients }) => {
    const params = { recipients: `${recipients}` }
    const { data } = await bizchatAxios.get(`/api/crm/list_unread_total/${from}`, { params })
    return data
}

export const getMassBizchatNotEmailed = async ({ crm_id }) => {
    if (!crm_id) return null
    const { data } = await bizchatAxios.get(`/api/crm/mass_not_emailed/${crm_id}`)
    return data
}

export const fetchBlobFromObjectURLAsync = async (url, filename) => {
    if (!url) return null
    const res = await fetch(url)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
}

const thumbnailWidth = 320

const processAttachedFileAsync = async (file) => {
    const [_, originalFilename] = file.name.match(/(.*)\.(jpeg|jpg|gif|png|pdf)$/i)
    const renamedFilename = nanoid()
    const message = [originalFilename, renamedFilename, file.extension]
    const renamedName = `${renamedFilename}.${file.extension}`
    const fileRenamed = new File([file.data], renamedName, { type: file.type })
    
    if (['jpeg', 'jpg', 'gif', 'png'].includes(file.extension.toLowerCase())) {
        const fileThumbRenamed = await skaler(file.data, { width: thumbnailWidth, name: renamedName })

        return [
            message,
            renamedName,
            fileRenamed,
            fileThumbRenamed
        ]

    }

    return [
        message,
        renamedName,
        fileRenamed
    ]
}

export const sendBizchatMessage = async ({ files = [], from, recipient, message, context }) => {
    try {
        if (files.length > 0) {

            const processedFiles = await Promise.all(files.map(([_, file]) => processAttachedFileAsync(file)))
            
            const form = new FormData
            const messageBodyArray = [message]
    
            for (const [message, renamedName, fileRenamed, fileThumbRenamed] of processedFiles) {
                form.append('attachments', fileRenamed, renamedName)
                if (fileThumbRenamed) form.append('thumbs', fileThumbRenamed, renamedName)
                messageBodyArray.push(message)
            }
    
            form.append('message', JSON.stringify({ from, recipient, message: JSON.stringify(messageBodyArray), context }))
            
            const { data } = await bizchatAxios.post('/api/crm/create_chat_attachments', form, { withCredentials: true })

            return data

        }
    
        const { data } = await bizchatAxios.post('/api/crm/create_chat', { from, recipient, message, context })

        return data
    
    } catch (e) {
        console.error(e);
    }
}

export const getBizchatMessagesLast5 = async ({ chatId, senderUserId }) => {
    const { data } = await bizchatAxios.get(`/api/messages_last_5/${chatId}/${senderUserId}`)
    return data
}

export const getBizchatLastMessage = async ({ from, recipient }) => {
    const { data } = await bizchatAxios.get(`/api/crm/last_message/${from}/${recipient}`)
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