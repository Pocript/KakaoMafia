/**Made By IMIS
*KakaoMable 1.0
**/
const scriptName = "";
const version = "1.0";
const SECRET = require("secret");
const roomName = '보드게임'
importPackage(javax.net.ssl);
importPackage(java.lang);
importPackage(java.net);
importPackage(java.io);

importPackage(org.jsoup);


const { KakaoLinkClient } = require('kakaolink'); 
const Kakao = new KakaoLinkClient("10f5c4ad305789c72dde5ff48a1ad485", 'http://localhost:3000');
Kakao.login(SECRET.EMAIL, SECRET.PASSWORD); 
const host = 'http://localhost:3000'

/* ---------------------------------------------------------------------------- */

let player =  [], //플레이어목록{ip, nick}
    grave = [], //죽은 플레이어 목록
    state = false,
    voteList = [],
    voter = [],
    voteResult = []
    
/* ---------------------------------------------------------------------------- */

const Bot = {};
var config = {
    address: '127.0.0.1',
    port: 3001,
};

var address = java.net.InetAddress.getByName(config.address);
var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 65535);
var inPacket = new java.net.DatagramPacket(buffer, buffer.length);

const Game = {
  main:function(room, message, sender){
          let isCommand = message.charAt(0) == "ㅁ";
          (isCommand) ? Game.command(room, message.substr(1), sender) : "";
    },
  command : function(room, cmd, sender){
      if(cmd=='생성') {
        if(state != false) return Bot.reply('이미 게임이 생성되었습니다.')
        Util.setState('produce')
        Bot.reply('게임을 생성합니다. 참여하실 분은 버튼을 눌러주세요.')
        Util.sendKakaoLink(room,'게임참여','게임에 참여하시겠습니까?','regist','아래 버튼을 눌러주세요.')
        state = 'produce'
      }if(cmd=='종료') {
        Bot.reply('게임이 종료되었습니다.')
        player =  [], //플레이어목록{ip, nick}
        grave = [], //죽은 플레이어 목록
        state = false,
        voteList = [],
        voter = [],
        voteResult = []
        Util.reset()
      }else if(cmd=='시작') {
        let gamePlayer = Jsoup.connect(host+'/regist/player')
        .method(Connection.Method.GET)
        .ignoreContentType(true)
        .execute()
        .body()
        gamePlayer = gamePlayer.split(',')
        if(state != 'produce') return Bot.reply('생성된 게임이 없어 게임을 시작할 수 없습니다.')
        else if(gamePlayer.length<4 || gamePlayer.length >= 12)  return Bot.reply('4명이상 12명 이하가 참여해야 게임을 시작할 수 있습니다.')
        let data = Jsoup.connect(host+'/role/shuffle')
        .method(Connection.Method.GET)
        .ignoreContentType(true)
        .execute()
        .body()
        player = JSON.parse(data)
        Util.setState('start')
        Bot.replyRoom('게임을 시작합니다. 먼저 직업배분을 시작하겠습니다. 아래 버튼을 눌러 직업을 확인해주세요.')
        Util.sendKakaoLink(room,'직업확인','직업을 확인하시겠습니까?','role','아래 버튼을 눌러주세요.')
        Thread.sleep(10000)
        Bot.replyRoom('5초 후에 게임을 시작합니다.')
        Thread.sleep(5000)
        Util.night()
        
        
      }
    }
  }

const Util = {
  getPlayer:function(){
    return player.map(e=>e.nick+' ('+e.role+')').join('\n')
  },
  reset:function(){
    Jsoup.connect(host+'/skil/reset').get()
  },
  setState:function(state){
    Jsoup.connect(host+'/state')
        .method(Connection.Method.POST)
        .data('state',state)
        .ignoreContentType(true)
        .execute()
        .body()
  },
  sendKakaoLink:function(roomName, but,title,path,desc){
    Kakao.sendLink(roomName, {
          link_ver: '4.0',
           template_id: 71832, 
           template_args: {
             BUT: but,
             Title:title,
             PATH:path,
             DESC:desc
           } 
           }, 'custom');
  },
  voteresult: function () {
    let result = Jsoup.connect(host+'/vote/result')
        .method(Connection.Method.GET)
        .ignoreContentType(true)
        .execute()
        .body()
    Bot.replyRoom(result)
    Thread.sleep(3000)
    Util.night()
  },
  night:function(){
        Thread.sleep(3000)
        if(!state) return;
        Util.setState('night')
        Bot.replyRoom('밤이 되었습니다. 아래버튼을 눌러 직업 능력을 사용하세요.')
        Util.sendKakaoLink(roomName,'능력사용','능력을 사용하시겠습니까?','skil','아래 버튼을 눌러주세요.')
        Thread.sleep(20000)
        if(!state) return;
        Bot.replyRoom('10초 남았습니다.')
        Thread.sleep(10000)
        if(!state) return;
        Bot.replyRoom('스킬 사용시간이 종료되었습니다.')
        Util.setState('debate')
        let result = Jsoup.connect(host+'/skil/result')
        .method(Connection.Method.GET)
        .ignoreContentType(true)
        .execute()
        .body()
        
        Bot.reply(result)
        
        Thread.sleep(2000)
        if(!state) return;
        Bot.reply('토론을 시작하겠습니다. 토론시간은 1분입니다.')
        
        Thread.sleep(60000)
        if(!state) return;
        Bot.reply('투표를 시작합니다. 투표시간은 1분입니다.')
        Util.setState('vote')
        Util.sendKakaoLink(roomName,'투표','투표를 하시겠습니까?','vote','아래 버튼을 눌러주세요.')
        
        Thread.sleep(1000)
        if(!state) return;
        voteTimer()
  }
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  
  Bot.reply = (cmd) => { replier.reply(cmd); };
	 Bot.replyRoom = (cmd) => { (msg) ? Api.replyRoom(roomName, cmd) : null; };
 
	 Game.main(room, msg, sender);
  
}

const socket = new DatagramSocket(3003);

new Thread({
  run: () => {
    try {
      while (true) {
        var buffer = java.lang.reflect.Array.newInstance(Byte.TYPE, 1024);
        var packet = new DatagramPacket(buffer, buffer.length);

        Log.d('Ready');

        socket.receive(packet);
        var decode = decodeURIComponent(new java.lang.String(packet.getData()))
        var string = decode.replace(/\0/g, '')
        var parse = JSON.parse(string)
        Log.d(string)
        if(parse.type == 'regist'){
          Api.replyRoom(roomName, parse.nick+"님이 게임에 참여하셨습니다.")
          player.push({ip:parse.ip,nick:parse.nick})
        }else if(parse.type == 'vote'){
          Api.replyRoom(roomName, parse.msg)
        }else if(parse.type == 'mafia'){
          state = false
          Thread.sleep(2000)
          Api.replyRoom(roomName,'마피아 수가 시민과 같아졌습니다. 마피아의 승리입니다.')
          Thread.sleep(1000)
          Bot.reply(Util.getPlayer())
          Util.reset()
        }else if(parse.type == 'crew'){
          state = false
          Thread.sleep(2000)
          Api.replyRoom(roomName, '마피아가 전멸했습니다. 시민의 승리입니다.')
          Thread.sleep(1000)
          Bot.reply(Util.getPlayer())
          Util.reset()
        }
      }
    } catch (err) {
      Log.e(err.toString());
    }
  },
}).start();

let voteTimerPower = false;
let voteTimerCount = 0
let VOTE_TIMER_OUT = 60


function voteTimer(){
     voteTimerPower = true;
      thread = new Thread
      ({
      run: function() {
      try {
        while (voteTimerPower) {
        Thread.sleep(1000);
      if (voteTimerCount >= VOTE_TIMER_OUT) {
        Bot.replyRoom("투표시간이 종료되었습니다.");
        Util.setState('night')
        voteTimerCount = 0;
		      voteTimerPower = false;
        Util.voteresult()
        return;
}
else {
voteTimerCount++;
((VOTE_TIMER_OUT-voteTimerCount ) == 20) ? Bot.reply("20초 남았습니다."):
((VOTE_TIMER_OUT-voteTimerCount ) == 10) ? Bot.reply("10초 남았습니다.") : null;
}
}
}
catch (e) {
Bot.reply(e);
}
}
}).start();
}

function onStartCompile() 
{ 
  socket.close()
  voteTimerPower = false;
  state = false; 
};
