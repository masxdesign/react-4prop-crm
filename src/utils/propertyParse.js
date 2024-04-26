import { isEmpty, trim } from "lodash"
import { escapetext } from "./misc"

const propertyParse = {
    addressText: (options) => (info) => {
        const { showMore, showBuilding, showPostcode } = options
        const { 
            hideidentity, 
            centreestate, 
            buildingnumber, 
            building, 
            streetnumber, 
            street, 
            towncity, 
            suburblocality, 
            matchpostcode 
        } = info

        const hasStreet = !isEmpty(street) && (hideidentity & 2) === 0
        
        let title = ''

		if (showMore) {

            if (showBuilding) {

                const hasBuildingNumber = !isEmpty(buildingnumber) && (hideidentity & 128) === 0
                const hasBuilding = !isEmpty(building) && (hideidentity & 64) === 0
    
                if (hasBuildingNumber) title += buildingnumber + (hasBuilding ? " ": ", ")
    
                title += hasBuilding ? `${building}, `: ''
            }
        }

        title += (hideidentity & 32) > 0 || isEmpty(centreestate) ? '': `${centreestate}, `

        if (showMore) {
			title += (hideidentity & 4) > 0 || isEmpty(streetnumber) ? '': (streetnumber + (hasStreet ? " ": ", "))
		}

		title += hasStreet ? `${street}, `: ''

		if(!isEmpty(suburblocality)) title += `${suburblocality}, `
		if(!isEmpty(towncity)) title += `${towncity}, `

		if(showPostcode) title += matchpostcode
		title = trim(title)
		title = trim(title, ',')

        return escapetext(title)

    },
    pictures: ({ images }) => {
        const output = []
        const captions = []
    
        images.split('*').forEach((image) => {
            if (image !== "") {
                const im = image.split('|')
                const z = x => im[1].includes('.') ? im[1]: `${x}.${im[1]}`
                output.push(x => `https://4prop.com/JSON/NIDs/${im[5]}/${im[0] !== '' ? im[0]: im[3]}/${z(x)}`)
                captions.push(im[2])
            }
        })
    
        const count = output.length
        const render_image_paths = x => output.map(k => k(x))
    
        return {
            count,
            previews: render_image_paths(3),
            thumbs: render_image_paths('t'),
            full: render_image_paths(0),
            captions
        }
    },
}

export default propertyParse