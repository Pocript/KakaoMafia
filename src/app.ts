import express, { Request, Response, NextFunction } from 'express';
import regist from "./router/regist";
import role from "./router/role";
import skil from "./router/skil";
import vote from "./router/vote";
import path from 'path'
import dgram  from 'dgram'
import state  from './router/state'

import http from 'http'


const app = express();
const server = http.createServer(app);
var io = require('socket.io')(server);

app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));


app.set('player', [{nick:'플레이어1',ip:'123.456.5'},{nick:'플레이어2',ip:'123.456.5'},{nick:'플레이어3',ip:'127.0..1',role:'의사'}]);
app.set('killed',undefined)
app.set('state',undefined)
app.set('initPlayer',undefined)

app.use("/state", state);
app.use("/vote", vote);
app.use("/regist", regist);
app.use("/skil", skil);
app.use("/role", role);
app.set('view engine','ejs')
app.set('views',path.join(__dirname, 'views'))
app.use('/static', express.static(__dirname + '/public'));

io.on('connection', (socket:any) => {
    socket.on('login', function(data:any){
		io.emit('con',data)
    });
    socket.on('message', function(nick:any,message:any){
        io.emit('message',nick,message)
        if(message.startsWith('/지목')){
            let kill = message.substr(4)
            let player = app.get('player')
            let killed = app.get('killed')
            let find = player.find((e:any)=>e.nick===kill)
            if(killed) return io.emit('server','이미 지목을 했습니다.')
            else if(!find) return io.emit('server','해당 플레이어가 존재하지 않습니다.')
            else if(find.role==='마피아') return io.emit('server','해당 플레이어는 마피아라 죽일 수 없습니다..')
            else{
                io.emit('server','"'+kill+'"을/를 지목했습니다.')
                app.set('killed',kill)
            }
        }
    });
});
    
const port = Number(process.env.PORT) || 3000;
server.listen(port,'0.0.0.0');
console.log('start')