
const mongoose = require('../config')
const Schema = mongoose.Schema

let memberList = new Schema({
    name: String, // 对象
    alias: String,
    city: String,
    endWord: String,
    date: String
})
const member =  mongoose.model('MemberList', memberList)

module.exports = {
    insert: (conditions) => { // 添加定时任务
        return new Promise((resolve, reject) => {
            member.create(conditions, (err, doc) => {
                if (err) return reject(err)
                console.log('创建成功', doc)
                return resolve(doc)
            })
        })
    },
    find: (conditions) => { // 获取定时任务列表
        return new Promise((resolve, reject) => {
            member.find(conditions, (err, doc) => {
                if (err) return reject(err)
                return resolve(doc)
            })
        })
    },
    update: (conditions) => { // 更新定时任务状态
        return new Promise((resolve, reject) => {
            member.updateOne(conditions, { hasExpired: true }, (err, doc) => {
                if (err) return reject(err)
                return resolve(doc)
            })
        })
    }
}