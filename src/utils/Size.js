import number_format from "./number-format"

export default class Size {
    units = { 0: "sqft", 1: "sqm", 2: "sqft", 4: "acres", 8: "ha" }
    constructor (min, max, unit) {
        this._min = this.getRound(min)
        this._max = this.getRound(max)
        this._unit = unit
    }
    getLabel (suffix, value) {
        return `${suffix} ${value > 999 ? number_format(value): value} ${this.unit}`
    }
    getRound (val) {
        return Math.round(val * 100) / 100
    }
    get isDefined () {
        return Math.max(this._min, this._max) > 0
    }
    get isRange () {
        return Math.min(this._min, this._max) > 0
    }
    get nonRangeLabel () {
        if(!this.isDefined || this.isRange) return null
        return this._min > 0 
            ? this.getLabel('min', this._min)
            : this.getLabel('max', this._max)
    }
    get unit () {
        return this.units[this._unit]
    }
    get size () {
        if(!this.isDefined) return null

        return {
            min: Math.min(this._min, this._max),
            max: Math.max(this._min, this._max),
            unit: this.unit,
            nonRangeLabel: this.nonRangeLabel
        }
    }
}