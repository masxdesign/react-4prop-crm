export default function TableHoverCard ({ cell, hideView }) {
    const info = cell.table ? cell : cell.getContext()
    const { dialogModel, components } = info.table.options.meta
  
    const handleShowDialog = ({ id }) => {
      dialogModel.showDialog(id)
    }
  
    return (
      <components.UserCard 
        data={cell.row.original}
        onView={handleShowDialog}
        hideView={hideView}
      />
    )
}