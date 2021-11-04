const Koa = require("koa")
const Router = require("koa-router")
const bodyParser = require('koa-bodyparser')
const assistant = require("./mongodb/model/assistant")
const member = require('./mongodb/model/member')
const room = require('./mongodb/model/room')
const sport = require('./mongodb/model/sport')


const app = new Koa()
const router = new Router()
app.use(bodyParser())

router.post('/api/addSchedule', async(ctx, next) => { // 添加定时任务
    let body = ctx.request.body;
    console.log('接收参数', body)
    let res = await assistant.insert(body);
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})

router.get('/api/getScheduleList', async(ctx, next) => { // 获取定时任务列表
    const condition = { hasExpired: false }
    let res = await assistant.find(condition)
    ctx.response.status = 200;
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})
router.post('/api/updateSchedule', async(ctx, next) => { // 更新定时任务
    const condition = { _id: ctx.request.body.id }
    let res = await assistant.update(condition)
    ctx.response.status = 200;
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})

// 增加提醒人
router.post('/api/addMention', async(ctx, next) => {
    const body = ctx.request.body;
    let res = await member.insert(body);
    ctx.body = {
        code: 200,
        msg: 'ok',
        data: res
    }
    next()
})
// 新增管理的群
router.post('/api/addRoom', async(ctx, next) => {
    const body = ctx.request.body;
    let res = await room.insert(body);
    ctx.body = {
        code: 200,
        msg: 'ok',
        data: res
    }
    next()
})
// 修改管理的群
router.post('/api/updateRoom', async(ctx, next) => {
    const condition = { name: ctx.request.body.name }
    let res = await room.update(condition);
    ctx.body = {
        code: 200,
        msg: 'ok',
        data: res
    }
    next()
})
// 查询管理的群
router.get('/api/queryRoom', async(ctx, next) => {
    // const condition = { name: false }
    let res = await room.find({})
    ctx.response.status = 200;
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})
// 新增报名人员
router.post('/api/addSportMenmber', async(ctx, next) => {
    const body = ctx.request.body;
    let res = await sport.insert(body);
    ctx.response.status = 200;
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})
// 取消报名人员
router.post('/api/delSportMenmber', async(ctx, next) => {
    const body = ctx.request.body;
    let res = await sport.update(body);
    ctx.response.status = 200;
    console.log(res)
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})
// 获取所有报名人员
router.get('/api/getSportMenmber', async(ctx, next) => {
    let res = await sport.findAll();
    ctx.response.status = 200;
    let data = res.filter((item) => item.isExit)
    ctx.body = { code: 200, msg: "ok", data }
    next()
})
const handler = async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.log(err)
        ctx.respose.status = err.statusCode || err.status || 500;
        ctx.response.type = 'html';
        ctx.response.body = '<p>出错啦</p>';
        ctx.app.emit('error', err, ctx);
    }
}
app.use(handler)
app.on('error', (err) => {
    console.error('server error:', err)
})

app.use(router.routes())
app.use(router.allowedMethods())
module.exports = app