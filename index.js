const { Wechaty, Friendship, config, log } = require('wechaty')
const schedule = require('./config/schedule')
const { FileBox } = require('file-box')
const Qrterminal = require('qrcode-terminal')
const { request } = require('./config/superagent')
const untils = require('./untils/index')
const host = 'http://127.0.0.1:3008/api'
const day = require('./config/day')

// 微信每日说配置
initDay = async() => {
    let logMsg
    let contact = await bot.Contact.find({ name: day.NICKNAME }) || await bot.Contact.find({ alias: day.NAME }) // 获取你要发送的联系人
    let one = await untils.getOne() //获取每日一句
    let weather = await untils.getWeather() //获取天气信息
    let today = await untils.formatDate(new Date()) //获取今天的日期
    // let memorialDay = untils.getDay(day.MEMORIAL_DAY) //获取纪念日天数
    let str = today + '新的一天开始啦,要开心噢^_^<br>' +
        '<br>今日天气<br>' + weather.weatherTips + '<br>' + weather.todayWeather + '<br>每日一句:<br>' + one + '<br><br>' + '————————最爱你的我'
    try {
        logMsg = str
        await contact.say(str) // 发送消息
    } catch (e) {
        logMsg = e.message
    }
    console.log(logMsg)
}

// 每次登录初始化定时任务
initSchedule = async(list) => {
    try {
        for (item of list) {
            let time = item.isLoop ? item.time : new Date(item.time)
            schedule.setSchedule(time, async() => {
                let contact = await bot.Contact.find({ name: item.subscribe })
                console.log('你的专属提醒开启啦！')
                await contact.say(item.content)
                if (!item.isLoop) {
                    request(host + '/updateSchedule', 'POST', '', { id: item._id }).then((result) => {
                        console.log('更新定时任务成功')
                    }).catch(err => {
                        console.log('更新错误', err)
                    })
                }
            })
        }
        // 登陆后初始化微信每日说
        schedule.setSchedule(day.SENDDATE, async() => {
            console.log('微信每日说开始工作了！')
            initDay()
        })
    } catch (err) {
        console.log('初始化定时任务失败', err)
    }
}

// 二维码生成
onScan = (qrcode, status) => {
    Qrterminal.generate(qrcode)
    const qrImgUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode)].join('')
    console.log(qrImgUrl)
}

// 登录事件·
onLogin = async(user) => {
    console.log(`贴心助理${user}登录了`)
    request(host + '/getScheduleList', 'GET').then((res) => {
        let text = JSON.parse(res.text)
        let scheduleList = text.data
        console.log('定时任务列表', scheduleList)
        initSchedule(scheduleList)
    }).catch(err => {
        console.log('获取任务列表错误', err)
    })
}

// 登出事件
onLogout = (user) => {
    console.log(`${user} 登出了`)
}

// 消息监听
onMessage = async(msg) => {
    const contact = msg.from()
    const content = msg.text()
    const room = msg.room()
    const meiri = await bot.Room.find({ topic: '北京无中介租房1群' })
    if (msg.self()) return
    if (room) {
        const roomName = await room.topic()
        console.log(`群名: ${roomName} 发消息人: ${contact.name()} 内容: ${content}`)
    } else {
        console.log(`发消息人: ${contact.name()} 消息内容: ${content}`)

        let keywordArray = content.replace(/\s+/g, ' ').split(" ") // 把多个空格替换成一个空格，并使用空格作为标记，拆分关键词
        console.log("分词后效果", keywordArray)
        if (content.indexOf('加群') > -1) {
            if (meiri) {
                try {
                    await meiri.add(contact)
                } catch (e) {
                    console.error(e)
                }
            }
        } else {
            contact.say('请回复关键词“加群”')
        }
    }
}

// 添加定时提醒
addSchedule = async(obj) => {
    request(host + '/addSchedule', 'POST', '', obj).then(async(res) => {
        res = JSON.parse(res.text)
        let nickName = res.data.subscribe
        let time = res.data.time
        let Rule1 = res.data.isLoop ? time : new Date(time)
        let content = res.data.content
        let contact = await bot.Contact.find({ name: nickName })
        schedule.setSchedule(Rule1, async() => {
            console.log('你的专属提醒开启啦！')
            await contact.say(content)
            if (!res.data.isLoop) {
                request(host + '/updateSchedule', 'POST', '', { id: res.data._id }).then((result) => {
                    console.log('更新定时任务成功')
                }).catch(err => {
                    console.log('更新错误', err)
                })
            }
        })
    }).catch(err => {
        console.log('错误', err)
    })
}

// 自动加好友
onFriendShip = async(friendship) => {
    let logMsg
    try {
        logMsg = '添加好友' + friendship.contact().name()
        console.log(logMsg)
        switch (friendship.type()) {
            /**
             *
             * 1. New Friend Request
             *
             * when request is set, we can get verify message from `request.hello`,
             * and accept this request by `request.accept()`
             */
            case Friendship.Type.Receive:
                await friendship.accept()
                break
                /**
                 *
                 * 2. Friend Ship Confirmed
                 *
                 */
            case Friendship.Type.Confirm:
                logMsg = 'friend ship confirmed with ' + friendship.contact().name()
                break
        }
    } catch (e) {
        logMsg = e.message
    }
    console.log(logMsg)
}

// 加群提醒
function roomJoin(room, inviteeList, inviter) {
    const nameList = inviteeList.map(c => c.name()).join(',')
    room.topic().then(function(res) {
        const roomNameReg = eval(day.ROOMNAME)
        if (roomNameReg.test(res)) {
            console.log(`群名： ${res} ，加入新成员： ${nameList}, 邀请人： ${inviter}`)
            room.say(`${res}：欢迎新朋友 @${nameList}，<br>公平点赞，互助互赞`)
        }
    })
}

const bot = new Wechaty({ name: 'WechatEveryDay', profile: config.default.DEFAULT_PROFILE, })
bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)
bot.on('friendship', onFriendShip)
bot.on('room-join', roomJoin)
bot.start()
    .then(() => { console.log('开始登陆微信') })
    .catch(e => console.error(e))