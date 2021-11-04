
const mongoose = require('../config')
const Schema = mongoose.Schema

let memberList = new Schema({
    name: String, // 对象
    alias: String,
    date: String,
    isExit: Boolean
})
const member =  mongoose.model('SportMember', memberList)

module.exports = {
    insert: (conditions) => { // 添加人员
        return new Promise((resolve, reject) => {
            member.create({ ...conditions, isExit: true }, (err, doc) => {
                if (err) return reject(err)
                console.log('创建成功', doc)
                return resolve(doc)
            })
        })
    },
    findAll: () => { // 获取所有
        return new Promise((resolve, reject) => {
            member.find({}, (err, doc) => {
                if (err) return reject(err)
                return resolve(doc)
            })
        })
    },
    update: (conditions) => { // 更新人员
        return new Promise((resolve, reject) => {
            member.updateOne(conditions, { isExit: false }, (err, doc) => {
                if (err) return reject(err)
                return resolve(doc)
            })
        })
    }
}