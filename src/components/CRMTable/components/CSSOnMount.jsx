import { useEffect, useState } from "react"

function CSSOnMount ({ render }) {
    const [isMount, setIsMount] = useState(false)
  
    useEffect(() => {
      setIsMount(true)
    }, [])
  
    return render(isMount)
}

export default CSSOnMount