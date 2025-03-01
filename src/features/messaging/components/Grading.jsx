import GradingWidget from "@/components/GradingWidget"
import { useGradeUpdater } from "@/features/searchReference/searchReference.mutation"

const Grading = ({ row, isAgent, onGradeChange }) => {
    const gradeUpdater = useGradeUpdater(row.id)
  
    const handleSelect = async (grade) => {
      if (isAgent) return
      await gradeUpdater.mutateAsync({ grade })
      onGradeChange(row.id, grade)
    }
  
    return (
        <GradingWidget 
            size={20}
            value={row.grade}
            onSelect={handleSelect}                                         
        />
    )
}

export default Grading