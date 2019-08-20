const mongoose = require('../config')
const Schema = mongoose.Schema

let assistant = new Schema({
    subscribe: String, // 订阅者
    setter: String, // 设定任务者
    content: String, // 订阅内容
    time: String, // 定时日期
    isLoop: Boolean, // 是否为循环定时任务
    hasExpired: { type: Boolean, default: false }, // 判断任务是否过期
    createdAt: { type: Date, default: Date.now },
})
const assit =  mongoose.model('Assistant', assistant)

module.exports = {
    insert: (conditions) => { // 添加定时任务
        return new Promise((resolve, reject) => {
            assit.create(conditions, (err, doc) => {
                if (err) return reject(err)
                console.log('创建成功', doc)
                return resolve(doc)
            })
        })
    },
    find: (conditions) => { // 获取定时任务列表
        return new Promise((resolve, reject) => {
            assit.find(conditions, (err, doc) => {
                if (err) return reject(err)
                return resolve(doc)
            })
        })
    },
    update: (conditions) => { // 更新定时任务状态
        return new Promise((resolve, reject) => {
            assit.updateOne(conditions, { hasExpired: true }, (err, doc) => {
                if (err) return reject(err)
                return resolve(doc)
            })
        })
    }
}