import { formatBytes } from "@/utils/formatBytes"

const attachmentCombiner = ([filename, renamed, fileType, fileSize]) => {
    return {
        filename,
        name: `${filename}.${fileType}`,
        url: fileSize 
            ? `${renamed}.${fileType}`
            : `${from}_${chatId}_${renamed}.${fileType}`,
        fileType,
        fileSize: fileSize 
            ? formatBytes(fileSize)
            : null
    }
}

export default attachmentCombiner