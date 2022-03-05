import express, { Request, Response, NextFunction } from "express";
import requestIp from 'request-ip'
import dgram from 'dgram';
var PORT = process.env.PORT;
var HOST = process.env.HOST;
const router = express.Router();

type shuf = {
    [key: string]: Array<string>
}

const Ishuffle:shuf = {
    "1":['마피아','경찰','의사'],
    "4":['마피아','경찰','의사','시민'],
    '5':['마피아','경찰','의사','시민','시민'],
    '6':['마피아','경찰','의사','시민','시민','시민'],
    '7':['마피아','경찰','의사','시민','시민','시민','시민'],
    '8':['마피아','마피아','경찰','의사','시민','시민','시민','시민'],
    '9':['마피아','마피아','경찰','의사','교주','시민','시민','시민','시민'],
    '10':['마피아','마피아','경찰','의사','교주','시민','시민','시민','시민','시민'],
    '11':['마피아','마피아','마피아','경찰','의사','시민','시민','시민','시민','시민','시민'],
    '12':['마피아','마피아','마피아','경찰','의사','시민','시민','시민','시민','시민','시민','시민']
}

let memberArr:Array<object> = []

router.get("/shuffle", (req: Request, res: Response, next: NextFunction) => {
    var player = req.app.get('player');
    let rolePack = shuffle(Ishuffle[String(player.length)])

    for (let i = 0; i < player.length; i++) {
        let nick = player[i].nick
        let playerIp = player[i].ip
        let role = rolePack[i]
        memberArr.push({nick:nick,ip:playerIp,role:role})
    }
    console.log(memberArr)
    req.app.set('player',memberArr)
    req.app.set('initPlayer',memberArr)
    res.send(memberArr)
    memberArr = []
});

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    var player = req.app.get('player');
    let ip = requestIp.getClientIp(req);
    let mine = player.find((e:any) => e.ip === ip)
    
    if(!mine){mine = "당신은 게임에 참여하지 않았습니다."}
    else mine = '당신의 직업은 '+mine.role+' 입니다'
    
    let elseMafia = player.filter((e:any) => e.role === '마피아'&&e.ip != ip) 
    console.log(elseMafia)
    res.render('role',{role:mine,elseMafia:(mine==='당신의 직업은 마피아 입니다'&&elseMafia)?elseMafia.map((e:any) => e.nick ):null})
})

function shuffle(array:Array<string>) { 
    return array.sort(() => Math.random() - 0.5); 
}




export = router;