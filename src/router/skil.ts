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
    var state = req.app.get('state');
    if(state !== 'night') return res.send('현재 스킬을 사용할 수 없습니다.')
    let me = player.find((e:any)=> e.ip === ip )
    if(!me) res.send('게임 참여자가 아닙니다.')
    else if(me.role === '마피아') res.render("mafia",{player:player,ip:ip,me:me});
    else if(me.role === '경찰') res.render("police",{player:player,ip:ip}); 
    else if(me.role === '의사') res.render("doctor",{player:player,ip:ip}); 
    else res.render("crew",{})
});

var healed:any;
var inspect:any

router.post("/doctor", (req: Request, res: Response, next: NextFunction) => {
    if(healed) res.send('already')
    else{
    healed = req.body.checked
    res.send('success')
    }
})

router.post("/police", (req: Request, res: Response, next: NextFunction) => {
    if(inspect) res.send('already')
    else{
    var player = req.app.get('player');
    inspect = req.body.checked
    let data = player.find((e:any)=>e.nick===req.body.checked)
    res.send(data)
    }
})

router.get("/result", (req: Request, res: Response, next: NextFunction) => {
    var killed = req.app.get('killed')
    var player = req.app.get('player');
    
    if(!killed){
          res.send('지난밤 아무도 죽지 않았습니다.')
        }else if(killed===healed){
          res.send('지난밤 의사의 치료로'+healed+'가 살아났습니다.')
        }else if(killed!==healed){
          res.send('지난밤 '+killed+'가 마피아에게 공격받아 사망했습니다.')
          let element = player.find((e:any) => e.nick===killed)
          let index = player.indexOf(element)
          player.splice(index,1);
    }
    
    healed = undefined;
    inspect = undefined;
    req.app.set('killed',undefined)
    
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
})

router.get("/reset", (req: Request, res: Response, next: NextFunction) => {
    var player = req.app.get('player');
    req.app.set('player',[]);
    healed = undefined
    inspect = undefined
    req.app.set('state',false);
    req.app.set('killed',undefined)
    res.send('success')
});

export = router;