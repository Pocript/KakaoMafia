import express, { Request, Response, NextFunction } from "express";
import requestIp from 'request-ip'
import dgram from 'dgram';
var PORT = Number(process.env.PORT);
var HOST = process.env.HOST;
const router = express.Router();


router.post("/", (req: Request, res: Response, next: NextFunction) => {
    let state = req.body.state
    req.app.set('state',state);
    res.send('success')
});



export = router;