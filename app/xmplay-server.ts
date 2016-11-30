const bodyParser = require('body-parser');
import * as express from 'express';

interface XMPlayExecutionStatusResponse extends express.Response {
  xmplayActionExecuted: boolean;
}

export default class XMPlayServer {
  constructor(middleware) {
    const app = express();

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    app.use(bodyParser.json());

    if (middleware) app.use(middleware);

    app.post('/execute', (req, res: XMPlayExecutionStatusResponse) => {
      if (res.xmplayActionExecuted)
        res.sendStatus(200);
      else
        res.sendStatus(500);
    });

    return app.listen(
      864,
      '0.0.0.0',
      () => {
        console.log('Application worker ' + process.pid + ' started...');
      }
    );
  }
}
