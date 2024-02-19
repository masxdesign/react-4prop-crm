import {
    rankItem,
    compareItems,
} from '@tanstack/match-sorter-utils'
import { sortingFns } from '@tanstack/react-table'

export const fuzzyFilter = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value)
  
    // Store the itemRank info
    addMeta({
        itemRank,
    })
  
    // Return if the item should be filtered in/out
    return itemRank.passed
}
  
export const fuzzySort = (rowA, rowB, columnId) => {
    let dir = 0
  
    // Only sort by rank if the column has ranking information
    if (rowA.columnFiltersMeta[columnId]) {
        dir = compareItems(
            rowA.columnFiltersMeta[columnId]?.itemRank,
            rowB.columnFiltersMeta[columnId]?.itemRank
        )
    }
  
    // Provide an alphanumeric fallback for when the item ranks are equal
    return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}