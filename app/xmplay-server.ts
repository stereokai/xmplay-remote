const bodyParser = require('body-parser');
import * as express from 'express';

export class XMPLayServer {
  constructor(middleware) {
    const app = express();

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    app.use(bodyParser.json());

    if (middleware) app.use(middleware);

    app.get('/', function(req, res){
      res.send('hello world');
    });

    return app.listen(
      864,
      '0.0.0.0',
      function () {
        console.log('Application worker ' + process.pid + ' started...');
      }
    );
  }
}
