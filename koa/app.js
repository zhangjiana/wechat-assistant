const Koa = require("koa")
const Router = require("koa-router")
const bodyParser = require('koa-bodyparser')
const assistant = require("./mongodb/model/assistant")
const member = require('./mongodb/model/member')

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