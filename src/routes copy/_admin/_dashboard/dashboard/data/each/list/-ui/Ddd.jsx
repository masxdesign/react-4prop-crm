import { forwardRef } from "react"
import Dd from "./Dd"
import { isEmpty } from "lodash"

const Ddd = forwardRef(({ label, row, name, bold, labelClassName, alwaysShow, collapsible, ...props }, ref) => {
    const value = row[name]
  
    if(!alwaysShow && isEmpty(value)) return null
  
    return (
      <Dd 
        ref={ref}
        bold={bold}
        label={label}
        labelClassName={labelClassName}
        collapsible={collapsible}
        value={(
          'email' === name ? (
            <a href={`mailto: ${value}`} className='hover:underline'>
              {value}
            </a>
          ) : 'phone' === name ? (
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