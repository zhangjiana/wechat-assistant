const config = require('../../wechat.config.js')
const { getRoom } = require('../proxy/api')
/**
 * 判断配置中是否存在此群
 * @param {*} arr 配置的群组
 * @param {*} name 有新人的群名
 * @return {*} 配置中此群的下标，不存在此群返回-1
 */
function roomHasConfig(arr,name){
  if(arr.length == 0) return -1;
  for(let i in arr){
    console.log(i)
    if (arr[i].name == name) return i
   }
   return -1
}
/**
 * 群中有新人进入
 */
async function onRoomjoin (room, inviteeList, inviter){
  let rooms = await getRoom();
  const nameList = inviteeList.map(c => c.name()).join(',')
  const roomName = await room.topic()
  console.log(rooms);
  const roomIndex = roomHasConfig(rooms,roomName)
  if (roomIndex>-1) {
      console.log(`群名： ${roomName} ，加入新成员： ${nameList}, 邀请人： ${inviter}`)
      room.say(`${roomName}：欢迎新朋友 @${nameList}，<br>${rooms[roomIndex].welcome}`)
  }
}

module.exports = onRoomjoin