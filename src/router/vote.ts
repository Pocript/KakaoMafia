import express, { Request, Response, NextFunction } from "express";
import requestIp from 'request-ip'
import dgram from 'dgram';
require("dotenv").config();
var PORT = Number(process.env.PORT);
var HOST = process.env.HOST;
const router = express.Router();


router.get("/", (req: Request, res: Response, next: NextFunction) => {
    var player = req.app.get('player');
    let ip = requestIp.getClientIp(req);
    
    let me = player.find((e:any)=> e.ip === ip )
    if(!me) res.send('게임 참여자가 아닙니다.')
    var state = req.app.get('state');
    if(state !== 'vote') return res.send('현재 투표를 할 수 없습니다.')
    else res.render("vote",{player:player,ip:ip,me:me});
});

var voter:Array<any> = []
type Vote = {[k: string]: number}
var vote:Vote = {}

router.post("/", (req: Request, res: Response, next: NextFunction) => {
    var player = req.app.get('player');
    let ip = requestIp.getClientIp(req);
    let me = player.find((e:any)=> e.ip === ip )
    if(!me) res.send('게임 참여자가 아닙니다.')
    if(voter.indexOf(ip) !== -1) return res.send('already')
    else{
        res.send('success')
        var voted = req.body.checked
        voter.push(ip)
        if(!vote[voted]) vote[voted] = 1
        else vote[voted]++
        console.log(vote)
        var message = new Buffer(encodeURIComponent(JSON.stringify({type:'vote',msg:me.nick+'님이 '+voted+'에 투표하셨습니다.'})));
        var client = dgram.createSocket('udp4');
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
        if (err) throw err
        client.close();
        })
    }
})

type VoteData = {name:string,num:number}

router.get("/result", (req: Request, res: Response, next: NextFunction) => {
    var player = req.app.get('player');
    let data = []
    var i;
    for ( i in vote) {

      let voteData:VoteData = {name:'',num:0}

      voteData.name = i

      voteData.num = vote[i]

      data.push(voteData)

    }

    let votes = data.map(e => e.num)

    let maxVotes = Math.max.apply(null, votes)

    let maxData = data.filter(e => e.num === maxVotes)

​

    if (!data[0]) {

      res.send('아무도 투표하지 않았습니다.')

    } else if (maxData.length > 1) {

      res.send('동점자가 나왔습니다. 투표를 무효화합니다.')

    } else {

      let name = maxData[0].name

      let num = maxData[0].num
      
      let element = player.find((e:any) => e.nick===name)
      res.send('투표결과 ' + name + '님이 ' + num + '개의 표를 받아 처형당했습니다.\n'+name+'님의 직업은 '+element.role+'입니다.')
      
      let index = player.indexOf(element)
      player.splice(index,1);
      
      let mafia = player.filter((e:any) => e.role === '마피아')
      if(mafia.length *2 >= player.length){
          
        var message = new Buffer(encodeURIComponent(JSON.stringify({type:'mafia'})));
        var client = dgram.createSocket('udp4');
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
        if (err) throw err
        client.close();
        })
        
      }else if(mafia.length === 0){
          
        var message = new Buffer(encodeURIComponent(JSON.stringify({type:'crew'})));
        var client = dgram.createSocket('udp4');
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
        if (err) throw err
        client.close();
        })
          
      }
    }
    voter = []
    vote = {}
})


export = router;