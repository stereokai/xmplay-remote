// const bodyParser = require('body-parser');
// import * as express from 'express';

// interface XMPlayExecutionStatusResponse extends express.Response {
//   xmplayActionExecuted: boolean;
// }

// export default class XMPlayServer {
//   constructor(middleware) {
//     // const app = express();

//     // app.use(function(req, res, next) {
//     //   res.header("Access-Control-Allow-Origin", "*");
//     //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     //   next();
//     // });

//     // app.use(bodyParser.json());

//     // if (middleware) app.use(middleware);

//     // app.post('/execute', (req, res: XMPlayExecutionStatusResponse) => {
//     //   if (res.xmplayActionExecuted)
//     //     res.sendStatus(200);
//     //   else
//     //     res.sendStatus(500);
//     // });

//     // const server = app.listen(
//     //   864,
//     //   'localhost',
//     //   () => {
//     //     console.log('Application worker ' + process.pid + ' started...');
//     //   }
//     // );

//     const io:SocketIO.Server = require('socket.io')('864');

//     io.on('action', function(msg){
//       console.log('message: ' + msg);
//     });
//     io.on('connection', (socket) => {
//       socket
//     });

//     return server;
//   }
// }
