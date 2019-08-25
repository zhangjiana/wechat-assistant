const api = require('../proxy/api');
const lib = require('../lib');

/**
 * 根据事件名称分配不同的api处理，并获取返回内容
 * @param {string} eName 事件名称
 * @param {string} msg 消息内容
 * @returns {string} 内容
 */
async function dispatchEventContent(eName, msg) {
  let content;
  switch (eName) {
    case 'rubbish':
      content = await api.getRubbishType(msg);
      break;
    case 'mingyan':
      content = await api.getMingYan();
      break;
    case 'star':
      let xing = lib.getConstellation(msg)
      content = await api.getStar(xing);
      break;
    case 'xing':
      content = await api.getXing(msg);
      break;
    case 'skl':
      content = await api.getSkl(msg);
      break;
    case 'lunar':
      content = await api.getLunar(msg);
      break;
    case 'goldreply':
      content = await api.getGoldReply(msg);
      break;
    case 'xhy':
      content = await api.getXhy(msg);
      break;
    case 'rkl':
      content = await api.getRkl(msg);
      break;
    default:
      break;
  }
  return content;
}

/**
 * 派发不同的机器人处理回复内容
 * @param {*} bot 机器人类别 0 天行机器人 1 天行的图灵机器人 2 图灵机器人
 * @param {*} msg 消息内容
 * @param {*} name 发消息人
 * @param {*} id 发消息人id
 */
async function dispatchAiBot(bot, msg, name, id) {
  let res;
  switch (bot) {
    case '0':
      res = await api.getResByTX(msg, id);
      break;
    case '1':
      res = await api.getResByTXTL(msg, id);
      break;
    case '2':
      res = await api.getResByTL(msg, id);
      break;
    default:
      res = '';
      break;
  }
  return res;
}
async function addRoom(name, welcome) {
  let config = {
    name: name,
    welcome: welcome
  }
  let res = await api.addRoom(config)
  return res;
}
module.exports = {
  dispatchEventContent,
  dispatchAiBot,
  addRoom
};
