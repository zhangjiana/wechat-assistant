const config = require('../../wechat.config');
const dispatch = require('./event-dispatch-service');
const api = require('../proxy/api');
const lib = require('../lib');
const { SPORT } = require('../../wechat.config');
const WEIXINOFFICIAL = ['朋友推荐消息', '微信支付', '微信运动', '微信团队', '文件传输助手']; // 微信官方账户，针对此账户不做任何回复
const DELETEFRIEND = '开启了朋友验证'; // 被人删除后，防止重复回复
const NEWADDFRIEND = '你已添加';
const REMINDKEY = '提醒'
/**
 * 设置提醒内容解析
 * @param {*} contact 设置定时任务的用户
 * @param {*} keywordArray 分词后内容
 */
function contentDistinguish(keywordArray,name) {
  let scheduleObj = {};
  let today = lib.getToday();
  scheduleObj.setter = name // 设置定时任务的用户
  scheduleObj.subscribe = keywordArray[1] === '我' ? name : keywordArray[1]; // 定时任务接收者
  if (keywordArray[2] === '每天') {
    // 判断是否属于循环任务
    console.log('已设置每日定时任务');
    scheduleObj.isLoop = true;
    if(keywordArray[3].includes(':') || keywordArray[3].includes('：')){
      let time = keywordArray[3].replace('：', ':');
      scheduleObj.time = lib.convertTime(time);
    }else{
      scheduleObj.time = ''
    }
    scheduleObj.content = (scheduleObj.setter === scheduleObj.subscribe) ? `亲爱的${scheduleObj.subscribe}，温馨提醒：${keywordArray[4].replace('我', '你')}`
        : `亲爱的${scheduleObj.subscribe},${scheduleObj.setter}委托我提醒你，${keywordArray[4].replace('我', '你')}`
  } else if (keywordArray[2] && keywordArray[2].includes('-')) {
    console.log('已设置指定日期时间任务');
    scheduleObj.isLoop = false;
    scheduleObj.time =
    keywordArray[2] + ' ' + keywordArray[3].replace('：', ':');
    scheduleObj.content = (scheduleObj.setter === scheduleObj.subscribe) ? `亲爱的${scheduleObj.subscribe}，温馨提醒：${keywordArray[4].replace('我', '你')}`
        : `亲爱的${scheduleObj.subscribe},${scheduleObj.setter}委托我提醒你，${keywordArray[4].replace('我', '你')}`
  } else {
    console.log('已设置当天任务');
    scheduleObj.isLoop = false;
    scheduleObj.time = today + keywordArray[2].replace('：', ':');
    scheduleObj.content = (scheduleObj.setter === scheduleObj.subscribe) ? `亲爱的${scheduleObj.subscribe}，温馨提醒：${keywordArray[3].replace('我', '你')}`
        : `亲爱的${scheduleObj.subscribe},${scheduleObj.setter}委托我提醒你，${keywordArray[3].replace('我', '你')}`
  }
  return scheduleObj;
}

/**
 * 获取事件处理返回的内容
 * @param {*} event 事件名
 * @param {*} msg 消息
 * @param {*} name 用户
 * @param {*} id 用户id
 * @returns {String}
 */
async function getEventReply(event,msg,name,id){
  let reply = await dispatch.dispatchEventContent(event,msg,name,id);
  return reply;
}

/**
 * 微信好友文本消息事件过滤
 * @param {string} msg 消息内容
 * @param {string} name 好友昵称
 * @returns {number} 返回回复内容
 */
async function filterFriendMsg(msg, name, id) {
  let obj = { type:'', content:'', event:{} }
  // 来自主人的吩咐 格式： 发消息给XX: ^^
  // 加定时给XX: ^^
  // 加群聊给啥群: 大是大非
  if (name === config.MASTER) {
    obj.type = 'order'
    let name, message, type;
    type = msg.substr(0,3);
    message = msg.split(':')[1];
    name = msg.split(':')[0].substr(4);
    switch (type) {
      case '发消息': obj.name = name; obj.content = message; return obj;
      case '加定时': obj.type = 'mention';
                    obj.content = message;
                    return obj;
      case '关定时': dispatch.shutDownSchedule(name, message);
                    obj.content = `给${name}${message}完毕`;
                    return obj;
      case '加群聊': let res = await dispatch.addRoom(name, message);
                    console.log(res);
                    if (res.code === 200) {
                      obj.event = '';
                      obj.content =  `给${name}加群聊完毕`;
                      return obj;
                    }
      default : break;
    }
  }
  if (msg.includes(DELETEFRIEND) ||WEIXINOFFICIAL.includes(name) ||msg.length > 100) {
    console.log('字符超100字符，或无效及官方消息，不做回复');
    obj.type ='text'
    obj.content = ''
    return obj;
  }
  if (msg.includes(NEWADDFRIEND)) {
    console.log(`新添加好友：${name}，默认回复`);
    obj.type ='text'
    obj.content = config.NEWFRIENDREPLY;
    return obj;
  }
  if (config.ADDROOMKEYLIST && config.ADDROOMKEYLIST.length > 0) {
    for (let item of config.ADDROOMKEYLIST) {
      if (item.key.includes(msg)) {
        console.log(`匹配到加群关键词${msg},正在邀请用户进群`);
        obj.type = 'addRoom'
        obj.event = {name:item.roomName}
        return obj;
      }
    }
  }
  if (config.KEYWORDLIST && config.KEYWORDLIST.length > 0) {
    for (let item of config.KEYWORDLIST) {
      if (item.key.includes(msg)) {
        console.log(`匹配到关键词${msg},正在回复用户`);
        obj.type = 'text'
        obj.content = item.reply;
        return obj;
      }
    }
  }
  if(msg.startsWith(REMINDKEY)){
      let msgArr = msg.replace(/\s+/g, ' ').split(" ")
      if(msgArr.length>3){
        obj.type = 'remind'
        obj.content = contentDistinguish(msgArr,name)
      }else{
        obj.type = 'text'
        obj.content = '提醒设置失败，请保证每个关键词之间使用空格分割开，并保证日期格式正确。正确格式为：“提醒(空格)我(空格)18:30(空格)下班回家”'
      }
      return obj
  }

  if (config.EVENTKEYWORDLIST && config.EVENTKEYWORDLIST.length > 0) {
    for (let item of config.EVENTKEYWORDLIST) {
      obj.type = 'event'
      switch (item.position) {
        case 'start':
          if (msg.startsWith(item.key)) {
            msg = msg.replace(item.key,'')
            obj.content = await getEventReply(item.event,msg,name,id)
            return obj;
          }
          break;
        case 'middle':
          if (msg.includes(item.key)) {
            msg = msg.replace(item.key,'')
            obj.content = await getEventReply(item.event,msg,name,id)
            return obj;
          }
          break;
        case 'end':
          if (msg.endsWith(item.key)) {
            msg = msg.replace(item.key,'')
            obj.content = await getEventReply(item.event,msg,name,id)
            return obj;
          }
          break;
        default:
          break;
      }
    }
  } 
    if(config.AUTOREPLY){
      console.log('开启了机器人自动回复功能')
      obj.type = 'text'
      obj.content = await dispatch.dispatchAiBot(config.DEFAULTBOT,msg,name,id)
    }else{
      console.log('没有开启机器人自动回复功能')
      obj.type = 'text'
      obj.content = ''
    }
    return obj
}

/**
 * 微信群文本消息事件监听
 * @param {*} msg 群消息内容
 * @param {*} name 发消息人昵称
 * @param {*} id 发消息人
 * @returns {number} 返回事件类型
 * 事件说明
 * 0 机器人回复
 * 1 开启了好友验证 || 朋友推荐消息 || 发送的文字消息过长,大于40个字符
 * 2 初次添加好友
 */
async function filterRoomMsg(msg,name, id) {
  let obj = {type:'',content:'',event:{}}
  // 报名运动
  if (config.SPORT.ENTER === msg) {
    obj.type = 'text'
    let res = await api.signInSport(name)
    if (res.code !== 200) {
      obj.content = '报名失败'
      return obj
    }
    let list = await api.getSportMembers()
    obj.content = `${name} 报名成功!
    时间: ${lib.getNextWeekDate(1)}
    地点: ${SPORT.PLACE},
    已报名列表:
    ${list.join('\n')}
    `
    // 报名成功的，给提示，并且带出报名列表
    return obj;
  }
  // 取消报名
  if (config.SPORT.OUT === msg) {
    obj.type = 'text'
    let res = await api.signOutSport(name)
    if (res.code !== 200) {
      obj.content = '取消报名失败'
      return obj
    }
    let list = await api.getSportMembers()
    obj.content = `${name} 报名成功!
    时间: ${lib.getNextWeekDate(1)}
    地点: ${SPORT.PLACE},
    已报名列表:
    ${list.join('\n')}
    `
    // 取消成功，带出报名列表
    return obj;
  }

  if (config.KEYWORDLIST && config.KEYWORDLIST.length > 0) {
    for (let item of config.KEYWORDLIST) {
      if (item.key.includes(msg)) {
        console.log(`匹配到关键词${msg},正在回复用户`);
        obj.type = 'text'
        obj.content = item.reply;
        return obj;
      }
    }
  }
//  针对提问的回复
  if (config.EVENTKEYWORDLIST && config.EVENTKEYWORDLIST.length > 0) {
    for (let item of config.EVENTKEYWORDLIST) {
      obj.type = 'event'
      switch (item.position) {
        case 'start':
          if (msg.startsWith(item.key)) {
            msg = msg.replace(item.key,'')
            obj.content = await getEventReply(item.event,msg,name,id)
            return obj;
          }
          break;
        case 'middle':
          if (msg.includes(item.key)) {
            msg = msg.replace(item.key,'')
            obj.content = await getEventReply(item.event,msg,name,id)
            return obj;
          }
          break;
        case 'end':
          if (msg.endsWith(item.key)) {
            msg = msg.replace(item.key,'')
            obj.content = await getEventReply(item.event,msg,name,id)
            return obj;
          }
          break;
        default:
          break;
      }
    }
  } 
  return {}
  // obj.type = 'text'
  // obj.content = await dispatch.dispatchAiBot(config.DEFAULTBOT,msg,name,id)
  // return obj
}

module.exports = {
  filterFriendMsg,
  filterRoomMsg
};
