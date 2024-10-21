import compact from "lodash/compact"
import map from "lodash/map"
import isPlainObject from "lodash/isPlainObject"
import difference from "lodash/difference"
import trimStart from "lodash/trimStart"

const propertyTypesCombiner = (typesFullList, subtypesIdMap, allowedTypes = null, allowedSubtypes = null) => {

    let _allowedSubtypes

    if(allowedSubtypes?.length > 0) {
        if(isPlainObject(allowedSubtypes[0])) {
            _allowedSubtypes = compact(map(allowedSubtypes, 'subtypeId')).map(Number)
        } else {
            _allowedSubtypes = allowedSubtypes.map(Number)
        }
    }

    const list = compact(typesFullList.map(([id, label, pstids, alias_, alias]) => {
        if((allowedTypes && !allowedTypes.map(Number).includes(Number(id))) || !pstids) return null

        const subtypesFullList = pstids.split('.').map(Number)
        const contains = subtypesFullList.length > difference(subtypesFullList, _allowedSubtypes).length

        const allowedType = allowedSubtypes?.find(({ typeId }) => typeId === Number(id))
        const allowedTypeLabel = allowedType?.label

        let _alias = alias

        if(allowedTypeLabel) {
            _alias += `,${label}`
        }

        return {
            id,
            label: allowedTypeLabel ?? label,
            alias: _alias,
            alias_,
            subtypes: compact(subtypesFullList.map((pstid) => {
                
                if(contains && _allowedSubtypes && !_allowedSubtypes.map(Number).includes(Number(pstid))) return null

                const [curr_label, curr_alias] = subtypesIdMap[pstid]

                const allowedSubtype = allowedSubtypes?.find(({ subtypeId }) => subtypeId === Number(pstid))
                const allowedSubtypeLabel = allowedSubtype?.label
                
                let alias = curr_alias

                if(allowedSubtypeLabel && allowedSubtypeLabel.toLowerCase() !== curr_label.toLowerCase()) {
                    alias += `,${curr_label}`
                    alias = trimStart(alias, ',')
                }

                return {
                    id: Number(pstid),
                    label: allowedSubtypeLabel ?? curr_label,
                    alias,
                    parentId: id
                }

            }))
        }
    }))

    return list
}

export default propertyTypesCombiner