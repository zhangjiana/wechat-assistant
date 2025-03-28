const api = require('../proxy/api');
const lib = require('../lib');
const service = require('../service/msg-filter-service');
/**
 * 获取每日新闻内容
 * @param {*} sortId 新闻资讯分类Id
 * @param {*} endWord 结尾备注
 */
async function getEveryDayRoomContent(sortId, endWord = '微信小助手') {
  let today = lib.formatDate(new Date()); //获取今天的日期
  let news = await api.getNews(sortId);
  let content = `${today}<br>${news}<br>————————${endWord}`;
  return content;
}
/**
 * 获取每日说内容
 * @param {*} date 与朋友的纪念日
 * @param {*} city 朋友所在城市
 * @param {*} endWord 结尾备注
 */
async function getEveryDayContent(date, city, endWord) {
  let one = await api.getOne(); //获取每日一句
  let weather = await api.getTXweather(city); //获取天气信息
  let today = lib.formatDate(new Date()); //获取今天的日期
  // let memorialDay = lib.getDay(date); //获取纪念日天数
  let sweetWord = await api.getSweetWord(); // 土味情话
  let str = `${today}<br>又是新的一天，元气满满的一天开，要开心噢^_^<br><br>今日天气<br>${
    weather.weatherTips
  }<br>${
    weather.todayWeather
  }<br>每日一句:<br>${one}<br><br>情话对你说:<br>${sweetWord}<br><br>————————${endWord}`;
  return str;
}


// 添加定时提醒
/**
 * 
 * @param {*} that bot 实例
 * @param {*} obj 
 */
async function addSchedule(that,obj) {
  try {
    let scheduleObj = await api.setSchedule(obj)
    let nickName = scheduleObj.subscribe
    let time = scheduleObj.time
    let Rule1 = scheduleObj.isLoop ? time : new Date(time)
    let content = scheduleObj.content
    let contact = await that.Contact.find({ name: nickName })
    let _id = scheduleObj._id
    lib.setSchedule(Rule1, async() => {
      console.log('你的专属提醒开启啦！')
      await lib.delay(10000)
      await contact.say(content)
      if (!scheduleObj.isLoop) {
          api.updateSchedule(_id)
      }
    })
    return true
  } catch (error) {
    console.log('设置定时任务失败',error)
    return false
  } 
}

/**
 * 获取私聊返回内容
 */
async function getContactTextReply(that, contact, msg) {
  const contactName = contact.name();
  const contactId = contact.id;
  let result = await service.filterFriendMsg(msg, contactName, contactId);
  if (result.type === 'order') {
    return result;
  } else if (result.type == 'text') {
    return result.content;
  } else if (result.type == 'addRoom') {
    let room = await that.Room.find({ topic: result.event.name });
    if (room) {
      try {
        await lib.delay(2000);
        contact.say('小助手正在处理你的入群申请，请不要重复回复...');
        await lib.delay(10000);
        await room.add(contact);
      } catch (e) {
        console.error('加群报错',e);
      }
    }else{
      console.log(`不存在此群：${result.event.name}`)
    }
    return ''
  }else if(result.type == 'remind') {
    try{
      let scheduleObj = result.content
      if(scheduleObj.isLoop){
        if(scheduleObj.time){
          let res = await addSchedule(that,scheduleObj)
          if(res){
            await lib.delay(1000)
            contact.say('本助手已记下，您就瞧好吧')
          }else{
            await lib.delay(1000)
            contact.say('添加提醒失败，请稍后重试')
          }
        }else{
          contact.say('提醒设置失败，请保证每个关键词之间使用空格分割开，并保证日期格式正确。正确格式为：“提醒(空格)我(空格)每天(空格)18:30(空格)下班回家')
        }
      }else{
        let isTime = lib.isRealDate(scheduleObj.time)
        if(isTime){
          await addSchedule(that,scheduleObj)
          await lib.delay(2000)
          contact.say('小助手已经把你的提醒牢记在小本本上了')
        }else{
          await lib.delay(2000)
          contact.say('提醒设置失败，日期格式不正确。正确格式为：“提醒(空格)我(空格)18:30(空格)下班回家” 或“提醒(空格)我(空格)2019-10-01 8:30(空格)还有两天就是老婆生日，要准备一下了”')
        }
      }
      return ''
    }catch(e){
      console.log(`定时任务出错，${e}`)
    }
  } else if(result.type == 'mention') {
    let res = await api.setMention(that, obj)
    if (res) {
      contact.say('ok啦，会每天给你设置的人提醒哦')
    }
  }else if(result.type == 'event') {
    return result.content;
  }
}
/**
 * 获取群消息回复
 * @param {*} content 群消息内容
 * @param {*} name 发消息者昵称
 * @param {*} id 发消息者id
 */
async function getRoomTextReply(content,name,id){
  console.log('room content',content)
  let result = await service.filterRoomMsg(content,name, id);
  if (result.type == 'text') {
    return result.content;
  } else if (result.type == 'event') {
    return result.content;
  }
}

module.exports = {
  getEveryDayContent,
  getEveryDayRoomContent,
  getContactTextReply,
  getRoomTextReply
};
