import Dd from "./Dd"

const Ddl = ({ items, row, ...props }) => {
    return items.map((item) => (
      <Dd key={item.label} {...item} {...props} />
    ))
}

export default Ddl