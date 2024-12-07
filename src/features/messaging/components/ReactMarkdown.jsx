import remarkGfm from "remark-gfm"
import ReactMarkdownPrimitive from 'react-markdown'
import { cn } from "@/lib/utils"

const LinkRender = ({ className, ...props }) => {
    return <a {...props} className={cn("underline", className)} target="_blank" rel="noreferrer" />
}

const ReactMarkdown = ({ content }) => {

    return (
        <ReactMarkdownPrimitive 
            components={{
                a: LinkRender
            }}
            children={content} 
            remarkPlugins={[remarkGfm]}                                     
        />
    )
}

export default ReactMarkdown