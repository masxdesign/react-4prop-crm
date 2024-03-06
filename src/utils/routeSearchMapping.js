import { compact, get, isEqual } from "lodash"

const routeSearchMapping = (initialState, state, prev, cb) => {
    
  let prev_ = { ...prev }

  const de = (o) => {
    if(prev_[o]) delete prev_[o] 
  }

  const q = (t, m = null, n = null) => {

    const o = m ?? t ?? n
    
    let s = get(state, t)
    
    if(isEqual(get(initialState, t), s)) {
      de(o)
      return null
    }

    let p = get(prev, m)

    if(m === 'page') {
      p = parseInt(p || 1) - 1
    }

    if(isEqual(s, p)) return null
    
    if(m === 'page') {
      s = s + 1
    }
    
    de(o)

    return [o, s]

  }

  const p = (...l) => ({ 
    ...prev_, 
    ...Object.fromEntries(compact(l)) 
  })
  
  return cb(p, q)
    
}

export default routeSearchMapping