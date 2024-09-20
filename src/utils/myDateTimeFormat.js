import { format, isToday } from "date-fns"

export default function myDateTimeFormat (date) {
    const date_ = date.replace(/(T|Z)/g, ' ')
    
    return isToday(date_) 
        ? format(date_, "HH:mm") 
        : format(date_, "d MMM yyy HH:mm")
}