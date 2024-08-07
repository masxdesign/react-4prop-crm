import { forwardRef, useMemo } from "react"
import Dd from "./Dd"
import { isEmpty, isString } from "lodash"
import htmlEntities from "@/utils/htmlEntities"

const Ddd = forwardRef(({ label, row, name, names, bold, labelClassName, alwaysShow, collapsible, ...props }, ref) => {
    const valueRaw = row[name]
    const value = useMemo(() => {

      if (names) return names[valueRaw]

      return isString(valueRaw) ? htmlEntities(valueRaw): valueRaw
    
    }, [valueRaw, names])
  
    if(!alwaysShow && isEmpty(value)) return null
  
    return (
      <Dd 
        ref={ref}
        bold={bold}
        label={label}
        labelClassName={labelClassName}
        collapsible={collapsible}
        value={(
          isEmpty(value) ? (
            <i className="opacity-50">(empty)</i>
          ) : 'email' === name ? (
            <a href={`mailto: ${value}`} className='hover:underline'>
              {value}
            </a>
          ) : ['phone', 'mobile'].includes(name) ? (
            <a href={`tel: ${value}`} className='hover:underline'>
              {value}
            </a>
          ) : 'website' === name ? (
            <a href={`https://www.${value}`} target='__blank' className='hover:underline'>
              {value}
            </a>
          ) : (
            <>
              {value}
            </>
          )
        )}
        {...props}
      />
    )
})

export default Ddd