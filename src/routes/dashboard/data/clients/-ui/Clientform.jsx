import * as Yup from "yup"
import categoriesQueryOptions from "@/api/categoriesQueryOptions"
import { formBuilder } from "../../../../../components/Form/Form"

const schema = Yup.object().shape({
    first: Yup.string().required(),
    email: Yup.string().required(),
})

const Clientform = formBuilder({ 
    schema, 
    groups: {
        PersonalDetails: [
            { name: "company", label: "Company", placeholder: "Your company" },
            { name: "title", label: "Title", placeholder: "Your title" },
            { name: "first", label: "First name", placeholder: "Your first name" },
            { name: "last", label: "Last name", placeholder: "Your last name" },
        ],
        ContactDetails: [
            { name: "email", label: "Email", placeholder: "Your email" },
            { name: "phone", label: "Phone", placeholder: "Your phone" },
        ],
        Address: [
            { name: "city", label: "City", placeholder: "Your city" },
            { name: "postcode", label: "Postcode", placeholder: "Your postcode" },
        ],
        Categories: [
            { name: "categories", type: "checkbox", queryOptions: categoriesQueryOptions }
        ]
    }
})

export default Clientform