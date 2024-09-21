import Ddd from "./Ddd"

const Dddl = ({ items, row }) => {
    return items.map((props) => (
      <Ddd key={props.name} row={row} {...props} />
    ))
}

export default Dddl