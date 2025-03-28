// 本文件是配置案例文件，请拷贝一份此文件后重命名为config.js，否则项目无法运行
module.exports = {
  MASTER: 'A Excellent',
  AUTOREPLY: true, // 是否设置机器人自动回复，默认关闭 false  开启为 true
  DEFAULTBOT: '0', // 默认机器人 0 天行机器人 1 天行对接的图灵机器人 2 图灵机器人
  TULINGKEY: '', //图灵机器人KEY
  TXAPIKEY: '8ea7b4ffa09db714dba3c07328b81ac5',// 必填，天行数据key，目前贡献的是我个人的，建议申请自己的天行数据key，可以对机器人个性化定制
  /**
   * 每日说定时任务（支持多人）
   * name:要发送好友的昵称 （注：不是微信号！不是微信号！不是微信号！）
   * alias:要发送好友的备注（默认查找备注优先，防止昵称带表情特殊字符）
   * memorialDay: 你与朋友的纪念日
   * city: 朋友所在城市，写的时候不要带‘市’
   * endWord: 每日说内容的最后的落款 案例中效果为‘——————————’
   * date: 每天定时的发送时间，案例中代表每天早上8点钟，具体规则见‘wechaty/lib/index.js’ (多个好友不要设置相同时间！不要设置相同时间！不要设置相同时间！)
   */ 
  DAYLIST: [
    {
      name:'lavender',
      alias:'AAAAA',
      city:'北京',
      endWord:'浪浪',
      date:'0 0 8 * * *'
    },
  ],

  /**
   * 群定时任务列表（支持多群配置）
   * roomName: 群名
   * sortId: 新闻资讯类别id （详情参见README.md数据字典）
   * endword: 结尾备注 ‘————————小助手雷欧’
   * date:每天定时的发送时间，案例中代表每天早上7点30分，具体规则见‘wechaty/lib/index.js’(多个群不要设置相同时间！不要设置相同时间！不要设置相同时间！)
   */
  ROOMLIST: [
    {roomName:'测试报名', sortId:22, endWord: 'QQ阅读君',date:'0 30 7 * * *'},
  ],
   /**
    * 自动添加好友关键词，留空代表同意任何好友请求 
    */
  ACCEPTFRIEND: [],
  /**
   * 好友进群通知，可配置多个
   */
  ROOMJOINLIST: [{name:'阅文集团-2020年-校招内推', welcome:'阅文集团2020年秋季校园招聘已经开启（http://t.cn/RppUPzE）\n 。今年走“内推码”机制，有内推码的可以免Hr简历删选，技术岗可以直接进入笔试环节。\n内推码在申请职位填写信息的时候填写.我的”内推码” 172969，每个码限30个名额，用完后再联系我更换。\n \n我在阅文等你来～～～'}],
  /**
   * 关键词回复列表
   * key: 多个关键词触发相同内容，非模糊匹配，为全匹配
   * reply: 回复内容
   */ 
  KEYWORDLIST:[ {key:['你好','您好'], reply:'你好，我是报名小助手，报名请在群里输入报名即可'} ],
  /**
   * 新通过好友，默认发送消息
   */
  NEWFRIENDREPLY: '你好，请问有什么可以帮助的？\n 回复内推，拉你进阅文校招内推群',
  /**
   * 关键词加群配置
   * key: 多个关键词触发相加群操作，全匹配
   * roomName: 发送邀请的群名
   */
  ADDROOMKEYLIST:[
    {key:['内推'], roomName:'阅文集团-2020年-校招内推'},
    {key:['租房'], roomName:'北京无中介租房群'}
  ],
  /**
   * 关键词触发指定事件，适用于私聊与群聊
   * key: 关键词
   * position: 关键词所在位置 start 开头  middle 不限 end 结尾
   * event: 触发事件名称，更多查看事件字典
   */
  EVENTKEYWORDLIST:[
    {key:'?',position:'start',event:'rubbish'},
    {key:'？',position:'start',event:'rubbish'},
    {key:'是什么垃圾',position:'end',event:'rubbish'},
    {key:'名人名言',position:'middle',event:'mingyan'},
    {key:'*',position:'start',event:'star'},
    {key:'姓',position:'start',event:'xing'},
    {key:'姓',position:'end',event:'xing'},
  ],  
  SPORT: {
    ENTER: '报名',
    OUT: '取消报名',
    TIME: '',
    PLACE: '恒通羽毛球球馆',
    TIPS: '活动前记得热热身哦'
  }
}