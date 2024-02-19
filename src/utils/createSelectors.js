const createSelectors = (store) => {
  store.use = {}

  for (let k of Object.keys(store.getState())) {
    store.use[k] = () => store((s) => s[k])
  }

  return store
}

export default createSelectors