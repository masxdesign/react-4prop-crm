const getCompanyLogoPath = (s, t = '', i, b = '') => {
    let p = s.split('?')

    if(p.length > 0){
        p = p[p.length - 1] // Last always the chosen one
        p = p.split('~')
        if(p.length > 0){
            const e = p[2] ? p[2]: 'jpg';
            let p2 = p[0];
            const p2a = p2.split('d'),
                p2b = p2a.length > 1,
                p1 = p2b ? p2a[0]: `${t}${i}`
            if(p2b) p2 = p2a[1]
            return x => `${b}/JSON/NIDs/DIDs/${p1}/${p2}/${x}.${e}`
        }
    }
}

export default getCompanyLogoPath