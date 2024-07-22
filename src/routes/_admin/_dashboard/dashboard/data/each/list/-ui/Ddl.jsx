import Dd from "./Dd"

const Ddl = ({ items, row, ...props }) => {
    return items.map(({ show = true, ...item }) => show ? (
      <Dd key={item.label} {...item} {...props} />
    ) : null)
}

export default Ddl