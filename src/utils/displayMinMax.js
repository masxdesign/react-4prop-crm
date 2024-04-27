import number_format from "./number-format"

const nf = (value, decimal = 0) => {
    const number_value = Number(value)
    return number_value > 10 ? number_format(value): parseFloat(number_value.toFixed(decimal))
}

const displayMinMax = (min, max, decimal) => `${min !== max && min > 0 ? `${nf(min, decimal)} - `: ''}${nf(max, decimal)}`

export default displayMinMax