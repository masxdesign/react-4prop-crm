import { v4 as uuidv4 } from 'uuid'
import map from 'lodash/map'
import { initialCategories } from './fake-data'
import localStorageController from '@/utils/localStorageController'

const genFakeUniqueEmail = (faker, list) => {
    let email 
    let c = 0
    do {
        email = faker.internet.email() 
        c++
    } 
    while (list.some((item) => item.email === email) && c < 30)

    return email
}

export const createClientObject = (newData = null) => ({
    id: uuidv4(),
    company: '',
    phone: '',
    email: '',
    title: '',
    first: '',
    last: '',
    city: '',
    postcode: '',
    website: '',
    categories: ['5'],
    contact_date: null,
    contact_next_date: null,
    created: `${new Date()}`,
    ...newData
})

const createRandomClient = (faker, list) => {
    const categoriesIds = map(initialCategories, 'value').slice(1)
    const gender = faker.person.sexType()
    const title = faker.person.prefix(gender)
    const first = faker.person.firstName(gender)
    const last = faker.person.lastName()
    const phone = faker.phone.number()
    const email = genFakeUniqueEmail(faker, list)

    return createClientObject({
        company: faker.company.name(),
        phone,
        email,
        title,
        first,
        last,
        city: faker.location.city(),
        postcode: faker.location.zipCode(),
        website: faker.internet.domainName(),
        categories: [faker.helpers.arrayElement(categoriesIds)],
        created: new Date().toJSON()
    })
}

export const createRandomClients = (key, count) => localStorageController(key).genFakeDataOnce(count, createRandomClient)

export const CSV_FIELDS = [
    ["company", true],
    ["title", false],
    ["first", false],
    ["last", false],
    ["email", false],
    ["phone", true],
    ["city", true],
    ["postcode", true],
    ["website", true]
]