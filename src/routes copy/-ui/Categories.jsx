import CategoriesPrimitive from "./CategoriesPrimitive"

const Categories = ({ info }) => {
    const { showSheet } = info.table.options.meta

    return (
      <CategoriesPrimitive 
        info={info} 
        badgeClassName="cursor-pointer hover:underline"
        onClick={() => showSheet(info, "categories")} 
      />
    )
}

export default Categories