import { format, isToday } from "date-fns"

export default function myDateTimeFormat (date) {
    try {

        const date_ = new Date(date)
        
        return isToday(date_) 
            ? format(date_, "HH:mm") 
            : format(date_, "d MMM yyy HH:mm")

    } catch (e) {

        

    }
}