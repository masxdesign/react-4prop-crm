const triggerShowDialog = (info) => {
    info.table.options.meta.dialogModel.showDialog(info.row.original.id)
}

export default triggerShowDialog