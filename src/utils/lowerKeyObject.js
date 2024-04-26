const lowerKeyObject = (r) => Object.fromEntries(Object.entries(r).map(([key, o]) => ([key.toLowerCase(), o])))

export default lowerKeyObject