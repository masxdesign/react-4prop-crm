import getCompanyLogoPath from "@/utils/getCompanyLogoPath"

const companyCombiner = (company) => {

    if(!company) return null

    const brand = (company) => {
        let output
        
        (['a', 'p', 's']).forEach((val, i) => {
            const im = company[val]
            if(!!im){
                output = getCompanyLogoPath(im, ['', 1, 2][i], company[['d', 'b', 'c'][i]], "https://4prop.com")
                return
            }
        })

        return {
            original: output ? output(1): '',
            full: output ? output(3): '',
            preview: output ? output(2): ''
        }
    }

    return {
        ...company,
        cid: company.c,
        bid: company.b,
        logo: brand(company),
        name: company.name,
        phone: company.phone
    }
    
}

export default companyCombiner