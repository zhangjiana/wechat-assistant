const common = require('../common');
const lib = require('../lib/index');



/**
 * 根据消息类型过滤私聊消息事件
 * @param {*} that bot实例
 * @param {*} msg 消息主体
 */
async function dispatchFriendFilterByMsgType(that, msg) {
  try {
    const type = msg.type();
    const contact = msg.talker(); // 发消息人
    const isOfficial = contact.type() === that.Contact.Type.Official
    let content = '';
    let reply = '';
    switch (type) {
      case that.Message.Type.Text:
        content = msg.text();
        if(!isOfficial){
            console.log(`发消息人${await contact.name()}:${content}`)
          if(content.trim()){
            reply = await common.getContactTextReply(that,contact,content);
            console.log('回复内容',reply)
            if (reply.type === 'order') {
              contact.say(reply.content);
              return;
            }
            // 主动发消息给某人
            if (reply.name) {
              let ruleContact = await that.Contact.find({ name: reply.name });
              ruleContact.say(reply.content)
              return
            }
            if (reply !== '') {
              await lib.delay(1000);
              contact.say(reply);
            }
          }
        }else{
          console.log('公众号消息')
        }
        break;
      case that.Message.Type.Emoticon:
        console.log(`发消息人${await contact.name()}:发了一个表情`)
        break;
      case that.Message.Type.Image:
        console.log(`发消息人${await contact.name()}:发了一张图片`)
        break;
      case that.Message.Type.Url:
        console.log(`发消息人${await contact.name()}:发了一个链接`)
        break;
      case that.Message.Type.Video:
        console.log(`发消息人${await contact.name()}:发了一个视频`)
        break;
      default:
        break;
    }
  } catch (error) {
    console.log('监听消息错误',error)
  }
}

/**
 * 根据消息类型过滤群消息事件
 * @param {*} that bot实例
 * @param {*} room room对象
 * @param {*} msg 消息主体
 */
async function dispatchRoomFilterByMsgType(that,room, msg) {
  let startTime = new Date()
  const contact = msg.talker(); // 发消息人
  const contactName = contact.name()
  const roomName = await room.topic()
  const type = msg.type();
  const mentionSelf = await msg.mentionSelf()
  let content = '';
  let reply = '';
  let contactId = contact.id
  let endTime = new Date()
  switch (type) {
    case that.Message.Type.Text:
      content = msg.text();
      console.log(`群名: ${roomName} 发消息人: ${contactName} 内容: ${content}`)
      // if(mentionSelf){
        content = content.replace(/@(.+?)\s/g,'')
        reply = await common.getRoomTextReply(content,contactName,contactId);
        console.log('回复内容',reply)
        if (reply !== '') {
          await lib.delay(1000);
          room.say(`@${contactName} ${reply}`);
        }
      // }
      break;
    case that.Message.Type.Emoticon:
        console.log(`群名: ${roomName} 发消息人: ${contactName} 发了一个表情`)
      break;
    case that.Message.Type.Image:
      console.log(`群名: ${roomName} 发消息人: ${contactName} 发了一张图片`)
      break;
    case that.Message.Type.Url:
      console.log(`群名: ${roomName} 发消息人: ${contactName} 发了一个链接`)
      break;
    case that.Message.Type.Video:
      console.log(`群名: ${roomName} 发消息人: ${contactName} 发了一个视频`)
      break;
    default:
      break;
  }
}

async function onMessage(msg) {
  const room = msg.room(); // 是否为群消息
  const msgSelf = msg.self(); // 是否自己发给自己的消息
  if (room) {
    dispatchRoomFilterByMsgType(this,room,msg)
  } else {
    if (msgSelf) return;
    dispatchFriendFilterByMsgType(this,msg)
  }
}

module.exports = onMessage;
