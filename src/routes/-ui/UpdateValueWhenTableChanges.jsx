import { useIsFirstRender } from "@uidotdev/usehooks"
import { useEffect } from "react"

const UpdateValueWhenTableChanges = ({ id, name, table, onChange }) => {
    const isFirstRender = useIsFirstRender()

    useEffect(() => {
      
        if(table && !isFirstRender) {
            const { rows } = table.getRowModel()
            const index = rows.findIndex(row => id === row.original.id)
            if (index > -1) {
                onChange(rows[index].getValue(name))
            }
        }

    }, [table?.options.data])

    return null
}

export default UpdateValueWhenTableChanges