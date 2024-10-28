import Ddd from "./Ddd"

const Dddl = ({ items, row, updateMutationOptions = null }) => {
    return items.map((props) => (
        <Ddd
            key={props.name}
            row={row}
            updateMutationOptions={updateMutationOptions}
            editable={props.editable}
            copiable={props.copiable}
            {...props}
        />
    ))
}

export default Dddl
