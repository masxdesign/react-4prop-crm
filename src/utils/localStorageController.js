import map from 'lodash/map'
import isMatch from 'lodash/isMatch'
import reject from 'lodash/reject'
import { reduce } from 'lodash'

const localStorageController = (key, initialState = null) => {
    const controller = {
        get key_ () {
            return JSON.stringify(key)
        },
        get rawdata () {
            return localStorage.getItem(this.key_)
        },
        get data () {
            let list = this.rawdata

            if(!list) throw new Error('No data')
            
            return JSON.parse(list)
        },
        bulkInsert (rows) {
            const newState = [
                ...this.data,
                ...rows
            ]
            this.save(newState)
            this.debug("bulkInsert", { rows })
        },
        add (newItem) {
            const newState = [
                ...this.data,
                newItem
            ]
            this.save(newState)
            this.debug("add", { newItem })
        },
        delete (predicate) {
            const prevCount = this.data.length
            const newState = reject(this.data, predicate)
            this.save(newState)

            const rowsAffects = prevCount - newState.length
            this.debug("delete", { predicate, rowsAffects })

        },
        update (predicate, newData) {
            let rowsAffects = 0
            const newState = map(this.data, (item) => {
                if(!isMatch(item, predicate)) return item
                rowsAffects++
                return {
                    ...item,
                    ...newData
                }
            })
            this.save(newState)
            this.debug("update", { predicate, newData, rowsAffects })
        },
        save (newState) {
            localStorage.setItem(this.key_, JSON.stringify(newState))
        },
        debug (op, stat) {
            console.log(op, stat);
        },
        async generateWithFaker (count = 1000, generateFn) {

            const { faker } = await import('@faker-js/faker')

            const list = reduce(Array(count).fill(0), (carry, _, __) => ([
                ...carry,
                generateFn(faker, carry)
            ]), [])
        
            if(list.length !== count) throw new Error('')

            this.save(list)

            console.log(`${this.key_}: Successfully generated ${list.length} fake clients for testing`)

            return list

        },
        async genFakeDataOnce (count, createRandomClient) {
            try {

                return this.data
            
            } catch (e) {
        
                const list = await this.generateWithFaker(count, createRandomClient)
        
                return list
        
            }
        }
    }

    if(!controller.rawdata && initialState) controller.save(initialState)

    return controller
}

export default localStorageController