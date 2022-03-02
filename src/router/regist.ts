import express, { Request, Response, NextFunction } from "express";
import requestIp from 'request-ip'
import dgram from 'dgram';
require("dotenv").config();
var PORT = Number(process.env.PORT);
var HOST = process.env.HOST;
const router = express.Router();


router.get("/", (req: Request, res: Response, next: NextFunction) => {
  var state = req.app.get('state');
  if(state !== 'produce') return res.send('현재 게임에 참여하실 수 없습니다.')
  res.render("regist",{});
});

router.get("/player", (req: Request, res: Response, next: NextFunction) => {
    var player = req.app.get('player');
    res.send(String(player.map((e:any,i:number)=> e.nick)));
});

router.post("/findRole", (req: Request, res: Response, next: NextFunction) => {
    var nick = req.body.nick
    var player = req.app.get('player');
    res.send(player.find((e:any)=>e.nick===nick));
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
    let ip = requestIp.getClientIp(req);
    var player = req.app.get('player');
    
    if(player.find((e:any) => e.ip === ip)){
        res.send("already")
        return;
    }else if(player.find((e:any) => e.nick === req.body.nick)){
        res.send("already nick")
        return;
    }else if(req.app.get('player').length >= 12){
        res.send("exceed")
        return;
    }
    
    var message = new Buffer(encodeURIComponent(JSON.stringify({type:'regist',nick:req.body.nick,ip:ip})));
    player.push({nick:req.body.nick,ip:ip})
    req.app.set('player',player)
    
    var client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err
    client.close();
    console.log(req.app.get('player'))
    });
    
    res.send("success");
});

router.get("/init-player", (req: Request, res: Response, next: NextFunction) => {
        res.send(req.app.get('initPlayer'))
})

export = router;