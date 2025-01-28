import * as yup from "yup"
import delay from "@/utils/delay";
import nanoid from "@/utils/nanoid";
import skaler from "@/utils/skaler";
import _, { isFunction, values } from "lodash";
import { fetchUser } from "./fourProp";
import bizchatClient from "./bizchatClient";

const emailErrorMessage = "Enter a valid email"
const schemaEmail = yup.string().email(emailErrorMessage).required()

const defaultCrmInclude = 'id,ownerUid,bz_id,next_contact,first,last,email,company,phone,created,hash,gradesharecount'

export const fetchTagsByUserId = async (user_id) => {
    const { data } = await bizchatClient.get(`/api/crm/v2/${user_id}/tags`)
    return data
}

export const fetchTagsByUserIdEnquired = async (bz_user_id) => {
    const { data } = await bizchatClient.get(`/api/crm/v2/${bz_user_id}/tags/enquired`)
    return data
}

export const crmUpdateTag = async (bz_user_id, tag_id, newName) => {
    const { data } = await bizchatClient.put(`/api/crm/v2/${bz_user_id}/tags/${tag_id}`, { newName })
    return data
}

export const getMassBizchatList = async ({ from }) => {
    const { data } = await bizchatClient.get(`/api/crm/mass_list/${from}`)
    return data
}

export const getMassBizchatStat = async ({ from }) => {
    const { data } = await bizchatClient.get(`/api/crm/mass_stat/${from}`)
    return data
}

export const getListUnreadTotal = async ({ from, recipients }) => {
    const params = { recipients: `${recipients}` }
    const { data } = await bizchatClient.get(`/api/crm/list_unread_total/${from}`, { params })
    return data
}

export const getMassBizchatNotEmailed = async ({ crm_id }) => {
    if (!crm_id) return null
    const { data } = await bizchatClient.get(`/api/crm/mass_not_emailed/${crm_id}`)
    return data
}

export const fetchBlobFromObjectURLAsync = async (url, filename) => {
    if (!url) return null
    const res = await fetch(url)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
}

const thumbnailWidth = 320

const formDataFileMergeAsync = async (formData, { file, filename = null }) => {
    const [_, originalFilename] = file.name.match(/(.*)\.(jpeg|jpg|gif|png|pdf)$/i)
    const renamedFilename = isFunction(filename) ? filename(file): nanoid()
    const renamedName = `${renamedFilename}.${file.extension}`

    formData.append('attachments', new File([file.data], renamedName, { type: file.type }), renamedName)

    if (['jpeg', 'jpg', 'gif', 'png'].includes(file.extension.toLowerCase())) {
        const fileThumbRenamed = await skaler(file.data, { width: thumbnailWidth, name: renamedName })
        formData.append('attachments', fileThumbRenamed, `p_${renamedName}`)
    }

    return [originalFilename, renamedFilename, file.extension, file.size]
}

export const formDataFilesMergeAsync = async (formData, { files = [], message, filename = null }) => {
    let message_type = 'M'
    let message_text = message

    if (files.length > 0) {

        const meta = await Promise.all(files.map(([_, file]) => 
            formDataFileMergeAsync(formData, {
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

        const formData = new FormData

        await formDataFilesMergeAsync(formData, {
            files, 
            message, 
            filename: () => `${from}-${recipient}crm-${nanoid()}`
        })

        formData.append('from', from)
        formData.append('recipient', recipient)

        if (context) formData.append('context', JSON.stringify(context))
        
        const { data } = await bizchatClient.post(`/api/crm/create_chat_attachments`, formData)

        return data
    
    } catch (e) {
        console.error(e);
    }
}

export const sendMassBizchat = async ({ files = [], from, recipients, subjectLine, message }) => {
    try {
        
        const safe_recipients = `${recipients}`.split(',').filter(id => id !== from)

        if (safe_recipients.length < 1) throw new Error('recipients is empty')

        const formData = new FormData

        await formDataFilesMergeAsync(formData, {
            files, 
            message,
            filename: () => `${from}mcrm-${nanoid()}`
        })
    
        formData.append('from', from)
        formData.append('recipients', safe_recipients)
        formData.append('subjectLine', subjectLine)
        
        const { data } = await bizchatClient.post(`/api/crm/send_mass_attachments`, formData)
    
        await delay(1000)
        return data

    } catch (e) {
        console.error(e);
    }
}

export const getBizchatMessagesLastN = async ({ bzUserId, chatId, limit }) => {
    if (!_.isInteger(limit)) throw new Error("limit is not an integer")
    const { data } = await bizchatClient.get(`/api/messages_last_n/${chatId}/${bzUserId}/${limit}`)
    return data
}

export const getBizchatMessagesLast5 = async ({ chatId, authUserId }) => {
    const { data } = await bizchatClient.get(`/api/messages_last_5/${chatId}/${authUserId}`)
    return data
}

export const getBizchatLastMessage = async ({ from, recipient }) => {
    const { data } = await bizchatClient.get(`/api/crm/last_message/${from}/${recipient}`)
    return data
}

export const getAllMailShots = async (nid, uid) => {
    const { data } = await bizchatClient.post(`/api/crm/all_mail_shots`, { nid, uid })
    return data
}

export const getCurrentApplicantUser = async () => {
    const { data } = await bizchatClient.post('/api/applicant/current')

    if(!data) return null

    return { ...data, applicant: true }
}

export const updateCurrentApplicantUser = async (form) => {
    const { data } = await bizchatClient.put('/api/applicant/current', { form })
    return data
}

export const resetPasswordApplicantUser = async (new_password, resetKey) => {
    const { data } = await bizchatClient.put('/api/applicant/reset-password', { new_password, resetKey })
    return data
}

export const forgotPasswordApplicantUser = async (email) => {
    const params = { email }
    const { data } = await bizchatClient.get('/api/applicant/reset-password', { params })
    return data
}

export const logoutShareApplicant = async () => {
    const { data } = await bizchatClient.post('/api/applicant/logout')
    return data
}

export const verifyShareApplicantUser = async (email, password) => {
    try {

        const { data } = await bizchatClient.post('/api/applicant/login', { email, password })
        return data

    } catch (e) {

        return { error: "Please contact administrator. Apologies for any inconvenience." }

    }
}

export const crmImport = async (list, authUserId) => {
    const { data } = await bizchatClient.post(`/api/crm/${authUserId}/import`, list)

    await delay(600)

    if (!data) throw new Error(list.length > 1 ? 'All emails already exist!': 'Email already exist!')

    return data
}

export const crmFacetList = async (column, authUserId) => {
    try {

        const { data } = await bizchatClient.get(`/api/crm/${authUserId}/facet/${column}`)

        return data

    } catch (e) {

        return { error: "Please contact administrator. Apologies for any inconvenience." }

    }
}

export const crmList = async ({ columnFilters, sorting, pagination, globalFilter }, authUserId) => {
    try {
        const defaultInclude = defaultCrmInclude

        let params = {
            page: pagination.pageIndex + 1,
            perpage: pagination.pageSize,
            include: defaultInclude
        }

        const [sorting_] = sorting

        if(sorting_) {

            const { id, desc } = sorting_

            params = {
                ...params,
                orderBy: id,
                direction: desc ? 'desc' : 'asc'
            }

        }

        const column = []
        const search = []

        for(const filter of columnFilters) {
            const { id, value } = filter
            let [toSearch] = value
            
            column.push(id)

            if (['a', 'company'].includes(id)) {
                toSearch = `=${toSearch}`
            }

            search.push(toSearch)
        }

        if (globalFilter?.column) {
            column.push(globalFilter.column)
            search.push(globalFilter.search)
        }

        if (column.length > 0) {
            params = {
                ...params,
                search,
                column
            }
        }

        const { data } = await bizchatClient.get(`/api/crm/${authUserId}/list`, { params })
        
        // let { data } = await fourProp.get('api/crud/CRM--EACH_db', { params })

        // if (authUserId) {
        //     let d2 = []
            
        //     if (data[1].length > 0) {
        //         const recipients = map(data[1], 'id')
        //         d2 = await getListUnreadTotal({ from: authUserId, recipients })
        //     }

        //     const data2 = [data[0], data[1].map(item => ({
        //         ...item,
        //         unread_total: find(d2, { recipient: item.id })?.unread_total ?? 0
        //     }))]

        //     return data2
        // }

        return data

    } catch (e) {

        console.log(e);
        

        return { error: "Please contact administrator. Apologies for any inconvenience." }

    }
}

export async function crmOwnerUidInfo (ownerUid) {
    if (`${ownerUid}`.includes('U')) {
        const data = await fetchUser(`${ownerUid}`.substring(1))
        return data
    }

    const { data } = await bizchatClient.get(`/api/crm/${ownerUid}/owner`)
    return data
}

export async function crmFilterByEmail (authUserId, search, pid = null) {
    const { data } = await bizchatClient.get(`/api/crm/${authUserId}/filterByEmail`, { params: { search, pid } })
    return data
}

export async function crmValidateEmail (authUserId, email, pid = null) {

    try {

        schemaEmail.validateSync(email)

        const { data } = await bizchatClient.get(`/api/crm/${authUserId}/validate-email`, { params: { email, pid } })
    
        await delay(400)

        return data

    } catch (e) {

        return {
            invalid: true,
            error: e
        }

    }

}

export async function crmListByIds (ids, authUserId) {
    const { data } = await bizchatClient.get(`/api/crm/${authUserId}/list-ids`, { params: { include: defaultCrmInclude, ids } })
    return data
}

export async function crmContactByHash (ownerUid, hash) {
    const { data } = await bizchatClient.get(`/api/crm/${ownerUid}/contactByHash`, { params: { include: defaultCrmInclude, hash } })
    return data
}

export async function crmGenHash (authUserId, import_id) {
    const { data } = await bizchatClient.post(`/api/crm/${authUserId}/gen-hash/${import_id}`)
    await delay(400)
    return data
}

export async function crmSharedPids (authUserId, import_id, tag_id = null) {
    const { data } = await bizchatClient.get(`/api/crm/${authUserId}/list-sharedPids/${import_id}`, { params: { tag_id } })
    return data
}

export async function crmSharedTagPids (from_uid) {
    const { data } = await bizchatClient.get(`/api/crm/listSharedTagPids/${from_uid}`)
    return data
}

export async function crmRecentGradeShares (from_uid) {
    const { data } = await bizchatClient.get(`/api/crm/geRecentGradeShares/${from_uid}`)
    return data
}

export async function crmListUpdateDetails (ownerUid, import_id, name, newValue) {
    const { data } = await bizchatClient.patch(`/api/crm/${ownerUid}/list/${import_id}`, { name, newValue })
    return data
}

export async function crmListById (id, authUserId) {
    const rows = await crmListByIds([id], authUserId)
    return rows[0]
}

export async function crmFetchNotes (import_id, authUserId) {
    const { data } = await bizchatClient.get(`/api/crm/${authUserId}/${import_id}/notes`)

    return [data, {}, null, null, []]
}

export async function addNoteAsync (authUserId, import_id, { type, body, dt }) {
    const { data } = await bizchatClient.post(`/api/crm/${authUserId}/note`, {
        type,
        body,
        import_id,
        dt
    })

    return data
}

export async function crmAddNote (variables, import_id, authUserId) {
    const { message = '', files, _button } = variables

    if (_button === "bizchat") {

        if (files.length < 1 && isEmpty(message)) throw new Error('attachments and message is empty')

        if(!authUserId) throw new Error('authUserId is not defined')

        alert('bizchat coming soon')

        return null

        // return sendBizchatMessage({ 
        //     files,
        //     message,
        //     from: authUserId,
        //     recipient: id
        // })

    }

    if (_.isEmpty(message)) throw new Error('message is empty')

    return addNoteAsync(authUserId, import_id, {
        type: 0,
        body: message,
        dt: null
    })
}

export const crmAddNextContact = async (variables, import_id, authUserId) => {
    try {
        const { next_contact, message = '' } = variables
    
        let type = 4
        let dt = null
    
        if (next_contact) {
            type = _.isEmpty(message) ? 3 : 2
            dt = next_contact
        }

        return addNoteAsync(authUserId, import_id, {
            type,
            body: message,
            dt
        })

    } catch (e) {
        console.log(e);
        
    }
}

export const crmAddLastContact = async (variables, import_id, authUserId) => {
    try {
        const { last_contact, message = '' } = variables

        if (isEmpty(last_contact)) throw new Error('last_contact is empty')

        return addNoteAsync(authUserId, import_id, {
            type: 1,
            body: message,
            dt: last_contact
        })

    } catch (e) {
        console.log(e);
        
    }
}

export async function crmTagList (ownerUid) {
    const { data } = await bizchatClient.get(`/api/crm/${ownerUid}/tags`)
    return data
}

export async function crmAddTag (ownerUid, name) {
    const { data } = await bizchatClient.post(`/api/crm/${ownerUid}/tag`, { name })
    return data
}

export async function crmShareGrade (ownerUid, recipient_import_id, tag_id, pidGrades) {

    console.log(
        ownerUid,
        recipient_import_id,
        tag_id,
        pidGrades
    );
    
    return null

    // const { data } = await bizchatClient.post(`/api/crm/${ownerUid}/share-grade`, { 
    //     recipient_import_id,
    //     tag_id,
    //     pidGrades
    //  })
    // return data
}

export const getEnquiryRoomAsync = async (userId, type, i) => {
	const params = { createdBy: userId, type, i }
	const { data } = await bizchatClient.get(`/api/enquiry_room`, { params, withCredentials: true })
	return data
}

export const addEnquiryRoomAsync = async (name, createdBy, type, i, tab, applicant_uid = null) => {
	const { data } = await bizchatClient.post(`/api/enquiry_room`, { name, createdBy, type, i, tab, applicant_uid }, { withCredentials: true })
	return data
}

export const uploadAttachmentsAsync = async (formDataOrBody, config = {}) => {
	const { data } = await bizchatClient.post(`/api/attachments`, formDataOrBody, { withCredentials: true, ...config })
    return data
}

export const propertyGradeShareAsync = async (uid, pid, grade, from_uid, tag) => {
    const body = { grade, from_uid, tag }
	const { data } = await bizchatClient.post(`/api/crm/propertyGradeShare/${uid}/${pid}`, body, { withCredentials: true })
    return data
}

export const getUidByImportId = async (ownerUid, import_id, createUser = false) => {
    const params = { createUser }
    const { data } = await bizchatClient.get(`/api/crm/${ownerUid}/uidByImportId/${import_id}`, { params })
    return data
}

export const sendBizchatPropertyEnquiry = async ({ from, recipients, message, property, choices, applicant_uid = null, attachments = [] }) => {

    const enquiryRoom = await addEnquiryRoomAsync(property.title, from, "P", property.id, 'E', applicant_uid)

    if (!enquiryRoom) throw new Error('missing enquiryRoom')
    
    const chat_id = enquiryRoom.id

    const contextObject = createPropertyEnquiryContextObject(enquiryRoom.name, property)

    return replyBizchatMessage({ from, chat_id, recipients, message, choices, attachments, contextObject })
}

export const sendBizchatPropertyGradeShare = async ({ uid, pid, grade, from_uid, tag, from, message, property }) => {
    const { success, error } = await propertyGradeShareAsync(uid, pid, grade, from_uid, tag)

    if (!success) throw new Error(error)

    return sendBizchatPropertyEnquiry({
        from,
        recipients: `U${uid}`,
        message,
        property,
        applicant_uid: uid
    })

}

export const replyBizchatEnquiryMessage = async ({
    property,
    from,
    chat_id,
    recipients,
    attachments,
    message
}) => {
    const contextObject = createPropertyEnquiryContextObject(property.title, property)

    return replyBizchatMessage({ 
        from, 
        chat_id, 
        recipients, 
        message,
        attachments,
        contextObject
    })
}

export const replyBizchatMessage = async ({ from, chat_id, recipients, message, choices, attachments = [], contextObject = null }) => {
    const messageDataObject = createEnquiryPropertyMessageDataObject(from, chat_id, recipients, message, choices)

    let formData
    
    if (attachments.length > 0) {
    
        formData = new FormData
    
        const meta = await Promise.all(attachments.map(([_, file]) => 
            formDataFileMergeAsync(formData, {
                file,
                filename: (file) => `${from}_${chat_id}_${file.name}`
            })
        ))
    
        formData.append("message", JSON.stringify({
            ...messageDataObject,
            type: 'A',
            body: JSON.stringify([
                messageDataObject.body, 
                ...meta
            ])
        }))
    
        if (contextObject) {
            formData.append("context", JSON.stringify(contextObject))
        }
    
    } else {
    
        formData = { message: messageDataObject }

        if (contextObject) {
            formData.context = contextObject
        }
    
    }
    
    return uploadAttachmentsAsync(formData)
}

export function createPropertyEnquiryContextObject (chatName, property) {
	const { id, sizeText, tenureText, title, content, thumbnail } = property

	return { 
		chatName, 
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

const defaultChoicesBool = {
    viewing: false, 
    pdf: false
}

function createEnquiryPropertyMessageDataObject(from, chat_id, recipients, message, choicesBool = defaultChoicesBool) {
    const { viewing, pdf } = choicesBool

	let choices = 0

	if(viewing) {
		choices = choices | 1
    }

	if(pdf) {
		choices = choices | 2
    }

	return { 
		from, 
		body: message, 
		recipients: `${recipients}`,
		chat_id,
		choices,
		type: 'M'
	}
}