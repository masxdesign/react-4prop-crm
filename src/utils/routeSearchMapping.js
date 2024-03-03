import { get, isEqual } from "lodash"

const routeSearchMapping = (state, prevSearch, cb) => {
    let u = prevSearch
    const q = (t, m = null, n = null) => {
      const e = get(state, t)
      const h = isEqual(get(state, t), e) ? null : e
      const o = m ?? t ?? n
      if(u[o]) delete u[o]
      if(m === 'page') return [o, h + 1]
      return [o, h]
    }
    const p = (...l) => ({ ...u, ...Object.fromEntries(l.filter(([_, value]) => !!value)) })
    return cb(p, q)
}

export default routeSearchMapping