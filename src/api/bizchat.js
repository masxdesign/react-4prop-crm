import delay from "@/utils/delay";
import nanoid from "@/utils/nanoid";
import skaler from "@/utils/skaler";
import axios from "axios";
import _, { isFunction } from "lodash";

export const BIZCHAT_BASEURL = window?.bizChatURL ?? import.meta.env.VITE_BIZCHAT_BASEURL

const bizchatAxios = axios.create({
	baseURL: BIZCHAT_BASEURL,
    withCredentials: true
})

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

const formDataFileMergeAsync = async ({ form, file, filename = null }) => {
    const [_, originalFilename] = file.name.match(/(.*)\.(jpeg|jpg|gif|png|pdf)$/i)
    const renamedFilename = isFunction(filename) ? filename(file): nanoid()
    const renamedName = `${renamedFilename}.${file.extension}`

    form.append('attachments', new File([file.data], renamedName, { type: file.type }), renamedName)

    if (['jpeg', 'jpg', 'gif', 'png'].includes(file.extension.toLowerCase())) {
        const fileThumbRenamed = await skaler(file.data, { width: thumbnailWidth, name: renamedName })
        form.append('attachments', fileThumbRenamed, `p_${renamedName}`)
    }

    return [originalFilename, renamedFilename, file.extension, file.size]
}

export const formDataFilesMergeAsync = async ({ form, files = [], message, filename = null }) => {
    let message_type = 'M'
    let message_text = message

    if (files.length > 0) {

        const meta = await Promise.all(files.map(([_, file]) => 
            formDataFileMergeAsync({
                form,
                file,
                filename
            })
        ))
        
        message_type = 'A'
        message_text = JSON.stringify([message_text, ...meta])
        
    }
    
    form.append('type', message_type)
    form.append('message', message_text)

    return form
}

export const sendBizchatMessage = async ({ files = [], from, recipient, message, context }) => {
    try {

        if (_.isEqual(from, recipient)) throw new Error('from and recipient match')

        const form = new FormData

        await formDataFilesMergeAsync({ 
            form,
            files, 
            message, 
            filename: () => `${from}-${recipient}crm-${nanoid()}`
        })

        form.append('from', from)
        form.append('recipient', recipient)

        if (context) form.append('context', JSON.stringify(context))
        
        const { data } = await bizchatAxios.post(`/api/crm/create_chat_attachments`, form)

        return data
    
    } catch (e) {
        console.error(e);
    }
}

export const sendMassBizchat = async ({ files = [], from, recipients, subjectLine, message }) => {
    try {
        
        const safe_recipients = `${recipients}`.split(',').filter(id => id !== from)

        if (safe_recipients.length < 1) throw new Error('recipients is empty')

        const form = new FormData

        await formDataFilesMergeAsync({
            form,
            files, 
            message,
            filename: () => `${from}mcrm-${nanoid()}`
        })
    
        form.append('from', from)
        form.append('recipients', safe_recipients)
        form.append('subjectLine', subjectLine)
        
        const { data } = await bizchatAxios.post(`/api/crm/send_mass_attachments`, form)
    
        await delay(1000)
        return data

    } catch (e) {
        console.error(e);
    }
}

export const getBizchatMessagesLast5 = async ({ chatId, authUserId }) => {
    const { data } = await bizchatAxios.get(`/api/messages_last_5/${chatId}/${authUserId}`)
    return data
}

export const getBizchatLastMessage = async ({ from, recipient }) => {
    const { data } = await bizchatAxios.get(`/api/crm/last_message/${from}/${recipient}`)
    return data
}

export const getAllMailShots = async (nid, uid) => {
    const { data } = await bizchatAxios.post(`/api/crm/all_mail_shots`, { nid, uid })
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