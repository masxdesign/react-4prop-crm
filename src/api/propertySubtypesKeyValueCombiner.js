const propertySubtypesKeyValueCombiner = (subtypes) => Object.fromEntries(
    subtypes
        .map(([id, label, alias, alias2, tid]) => ([ id, [label, alias === "" ? alias2: (alias2 === "" ? alias: `${alias},${alias2}`), tid] ]))
)

export default propertySubtypesKeyValueCombiner