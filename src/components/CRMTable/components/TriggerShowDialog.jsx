const TriggerShowDialog = ({ info, render }) => {
    const trigger = () => {
      info.table.options.meta.dialogModel.showDialog(info.row.original.id)
    }

    return render({ trigger })
}

export default TriggerShowDialog