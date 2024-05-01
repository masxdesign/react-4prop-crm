const displayTenure = ({ isRent, rent, isSale, price }) => `${isRent ? `${rent}${isSale ? ' | ': ''}`: ''}${isSale ? price: ''}`

export default displayTenure