const getColumnValue = (info, names = null) => {
    const infoValue = info.getValue()
    const value = names?.[infoValue] ?? infoValue

    return value
}

export default getColumnValue