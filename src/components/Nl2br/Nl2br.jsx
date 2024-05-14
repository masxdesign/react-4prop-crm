import { useMemo } from "react"

const useNl2Lines = (text) => useMemo(() => text.replace(/\<br\>/g, '\n').split('\n'), [text])

const htmlTagsRegExp = /(<([^>]+)>)/gi

const useLinesStripHtmlTags = (lines) => useMemo(() => lines.map((line) => line.replace(htmlTagsRegExp, "")), [lines])

const Nl2br = ({ itemClassName, itemStyle, text }) => {
    const lines = useLinesStripHtmlTags(useNl2Lines(text))
    return lines.map((str, key) => (
        <span key={key} style={{ display: "block", ...itemStyle }} className={itemClassName}>
            {str.length > 0 ? str: <>&nbsp;</>}
        </span>
    ))
}

export default Nl2br