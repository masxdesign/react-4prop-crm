import { Button } from "@/components/ui/button"

const ColumnViewButton = ({ info }) => {

    const handleClick = () => {
      info.table.options.meta.dialogModel.showDialog(info.row.original.id)
    }
  
    return (
      <Button size="xs" className="bg-emerald-600 hover:bg-emerald-500" onClick={handleClick}>
        view
      </Button>
    )
}

export default ColumnViewButton