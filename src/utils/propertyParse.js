import { chain, isEmpty, isUndefined, map, memoize, trim } from "lodash"
import { escapetext } from "./misc"
import Size from "./Size"
import displayMinMax from "./displayMinMax"
import doDecimalSafeMath from "./doDecimalSafeMath"

const typesCollectionHelper = memoize((typesCollection) => {
    const typesEntries = typesCollection
        .map((data) => [data.id, { data, pstids: map(data.subtypes, "id")}])

    const typesList = Object.fromEntries(typesEntries)

    const subtypes = chain(typesCollection)
        .map(({ subtypes }) => map(subtypes, "id"))
        .flatten()
        .uniq()
        .map((pstid) => [
            pstid, 
            typesEntries
                .filter(([, { pstids }]) => pstids.includes(pstid))
                .map(([id, { data }]) => ({ tid: id, data: data.subtypes.find(({ id }) => id === pstid) }))
        ])
        .fromPairs()
        .value()

    const crawler = (ids, mapper) => chain(ids)
        .split(",")
        .compact()
        .uniq()
        .map((id) => mapper[id]?.data)
        .compact()
        .value()

    return {
        getTypesFromString(tids) {
            return crawler(tids, typesList)
        },
        getSubtypesFromString(pstids) {
            return crawler(pstids, subtypes)
        },
        getSubtype(pstid) {
            return subtypes[pstid]?.data
        },
        equalizeStrings(types, pstids) {
            let types_ = types.split(",")
            const pstids_ = pstids.split(",")

            pstids_.forEach((pstid) => {
                if(!subtypes[pstid]) return
                const [{ tid }] = subtypes[pstid]
                if(types_.includes(`${tid}`)) return
                types_.push(`${tid}`)
            })

            types_ = types_.filter((tid) => {
                return typesList[tid]?.pstids?.some((pstid) => pstids_.includes(`${pstid}`))
            })

            return [types_, pstids_]
        }
    }
})

const propertyParse = {
    addressText: (options) => (info) => {
        const { showMore, showBuilding, showPostcode } = options
        const { 
            hideidentity, 
            centreestate, 
            buildingnumber, 
            building, 
            streetnumber, 
            street, 
            towncity, 
            suburblocality, 
            matchpostcode 
        } = info

        const hasStreet = !isEmpty(street) && (hideidentity & 2) === 0
        
        let title = ''

		if (showMore) {

            if (showBuilding) {

                const hasBuildingNumber = !isEmpty(buildingnumber) && (hideidentity & 128) === 0
                const hasBuilding = !isEmpty(building) && (hideidentity & 64) === 0
    
                if (hasBuildingNumber) title += buildingnumber + (hasBuilding ? " ": ", ")
    
                title += hasBuilding ? `${building}, `: ''
            }
        }

        title += (hideidentity & 32) > 0 || isEmpty(centreestate) ? '': `${centreestate}, `

        if (showMore) {
			title += (hideidentity & 4) > 0 || isEmpty(streetnumber) ? '': (streetnumber + (hasStreet ? " ": ", "))
		}

		title += hasStreet ? `${street}, `: ''

		if(!isEmpty(suburblocality)) title += `${suburblocality}, `
		if(!isEmpty(towncity)) title += `${towncity}, `

		if(showPostcode) title += matchpostcode
		title = trim(title)
		title = trim(title, ',')

        return escapetext(title)

    },
    pictures ({ images }) {
        const output = []
        const captions = []
    
        images.split('*').forEach((image) => {
            if (image !== "") {
                const im = image.split('|')
                const z = x => im[1].includes('.') ? im[1]: `${x}.${im[1]}`
                output.push(x => `https://4prop.com/JSON/NIDs/${im[5]}/${im[0] !== '' ? im[0]: im[3]}/${z(x)}`)
                captions.push(im[2])
            }
        })
    
        const count = output.length
        const render_image_paths = x => output.map(k => k(x))
    
        return {
            count,
            previews: render_image_paths(3),
            thumbs: render_image_paths('t'),
            full: render_image_paths(0),
            captions
        }
    },
    types: (filtersTypes, columnName = 'id') => (info) => {
        const { types, pstids } = info
        
        if(!filtersTypes) return {}

        const helper = typesCollectionHelper(filtersTypes)

        const [typesArray] = helper.equalizeStrings(types, pstids)
        
        const list = typesArray.filter((v) => ![50].includes(Number(v))).map((v) => {
            const item = filtersTypes.find((t) => String(t[columnName]) === v)

            if(!item) return {}

            const { subtypes, ...rest } = item

            if(!subtypes) return item

            const pickedSubtypes = subtypes.filter((t) => `,${pstids},`.includes(`,${t.id},`))

            return {
                ...rest,
                subtypes: pickedSubtypes
            }
        })

        const allPickedSubtypes = chain(list)
            .map('subtypes')
            .flatten()
            .compact()
            .reverse()
            .value()

        const types_ = chain(list)
            .filter((item) => JSON.stringify(item) !== '{}')
            .reverse()
            .value()

        if(allPickedSubtypes.length > 0) {
            return { 
                types: types_, 
                subtypes: allPickedSubtypes 
            }
        }

        return {
            types: types_,
            subtypes: null
        }
    },
    size ({ sizeunit, sizemin, sizemax, sizeunitexternal, minexternal, maxexternal }) {
        const size = new Size(sizemin, sizemax, sizeunit)
        const sizeExt = new Size(minexternal, maxexternal, sizeunitexternal)

        return {
            isExt: sizeExt.isDefined,
            land: sizeExt.size,
            isIn: size.isDefined,
            ...size.size
        }
    },
    tenure ({ tenure, price, rent, rentperiod, minintsqft, maxintsqft, /* reqs */ pricemin, pricemax, rentmin, rentmax }) {
        const period = { "-1": "/sqft", "-2": "/sqm", "1": "pa", "2": "monthly", "4": "weekly" }

        const isRent = (tenure & 3) > 0
        const isSale = (tenure & 12) > 0

        // Rent
        const isLease = (tenure & 1) > 0
        const isShortLease = (tenure & 2) > 0
        
        // Sale
        const isFreehold = (tenure & 4) > 0
        const isLongLeaseHold = (tenure & 8) > 0

        const rentCheckIndex = {
            0: isLease,
            1: isShortLease
        }

        const saleCheckIndex = {
            2: isFreehold,
            3: isLongLeaseHold
        }

        const shortLabels = [
            'Lease', 'ShortLs', 'FHold', 'LongLs'
        ]

        const combiner = (m, n) => Object.entries(m).filter(([_, bool]) => bool).map(([i]) => n[i])

        const priceMinMax = isUndefined(pricemin) || Math.max(pricemin, pricemax) < 1 ? '': `£${displayMinMax(pricemin, pricemax, 2)}`
        const rentMinMax = isUndefined(rentmin) || Math.max(rentmin, rentmax) < 1 ? '':`£${displayMinMax(rentmin, rentmax, 2)} ${period[rentperiod]}`

        const extended = {
            shortSaleText: `${combiner(saleCheckIndex, shortLabels).join('/')}  ${priceMinMax}`,
            shortRentText: `${combiner(rentCheckIndex, shortLabels).join('/')}  ${rentMinMax}`
        }
    
        let priceAlt = ""
        let rentAlt = ""

        const intsqft = Math.max(minintsqft, maxintsqft)

        if(intsqft > 0) {
            if(isRent && rent > 0) {
                //rent
                rentAlt = "£"
                
                if(["-1", "-2"].includes(rentperiod)) {
                    rentAlt += number_format(("-1" === rentperiod ? 1: 0.092903) * rent * intsqft) + " pa"
                } else {
                    let r = 1

                    if(rentperiod === "4") r = 52
                    if(rentperiod === "2") r = 12

                    const res = Math.ceil(doDecimalSafeMath(doDecimalSafeMath(rent, "*", r), "/", intsqft))
                    rentAlt += (res < 1 ? res.toFixed(2): number_format(res)) + " /sqft"
                }
            }
    
            if(isSale && price > 0) {
                //buy
                const res = Math.ceil(doDecimalSafeMath(price, "/", intsqft))
                priceAlt = "£" + (res < 1 ? res.toFixed(2): number_format(res)) + " /sqft"
            }
        }

        if(isRent) {
            rent = number_format(rent)
            rent = rent == 0 ? 
                (isRent ? "£ROA": ""): 
                `£${rent} ${period[rentperiod]}`
        }
        
        if(isSale) {
            price = number_format(price)
            price = price == 0 ? 
                (isSale ? "£POA": ""): 
                `£${price}`
        }
        
        const text = isSale === isRent ? "Rent or Sale" : (isSale ? "Sale" : "Rent")   
    
        return {
            rent,
            rentAlt,
            price,
            priceAlt,
            isSale,
            isRent,
            isSaleRent: isSale && isRent,
            value: tenure,
            text,
            extended
        }
    },
}

export default propertyParse