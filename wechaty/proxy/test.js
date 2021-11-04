const Crawler = require('Crawler');
const api = require('../proxy/api');
async function add(name) {
    try {
        const res = await api.signInSport(name)
        console.log(res)
    } catch(err) {

    }
}

async function del(name) {
    try {
        const res = await api.signOutSport(name)
        console.log(res)
    } catch(err) {

    }
}
async function get() {
    try {
        const res = await api.getSportMembers()
        console.log(res)
    } catch(err) {

    }
}
add('123')
// del('涨价21')
// get()
