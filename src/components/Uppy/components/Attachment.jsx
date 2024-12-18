import { BIZCHAT_BASEURL } from "@/services/bizchatClient"
import { cx } from "class-variance-authority"
import { defaultStyles, FileIcon } from "react-file-icon"

const Attachment = ({ name, url, fileType, fileSize, className }) => {
    return (
        <a 
            href={`${BIZCHAT_BASEURL}/${url}`}
            target="__blank"
            className={cx("flex gap-3 items-center p-1 border rounded text-xs hover:bg-sky-50 hover:border-sky-500", className)}
        >
            <div className="w-7 max-h-10 overflow-hidden">
                {['jpg', 'jpeg', 'gif', 'png'].includes(fileType) ? (
                    <img src={`${BIZCHAT_BASEURL}/p_${url}`} className="max-w-full" />
                ) : (
                    <FileIcon extension={fileType} {...defaultStyles[fileType]} />
                )}
            </div>
            <span className=" w-3/4 grow flex gap-2">
                <span className="flex-1">
                    {name}
                </span>
                {fileSize && <span className="text-muted-foreground text-nowrap">{fileSize}</span>}
            </span>
        </a>
    )
}

export default Attachment