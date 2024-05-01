import displayMinMax from "./displayMinMax"

const displaySize = ({ min, max, unit, decimal }) => `${displayMinMax(min, max, decimal)} ${unit}`

export default displaySize