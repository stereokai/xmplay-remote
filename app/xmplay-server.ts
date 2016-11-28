const express = require('express');
const bodyParser = require('body-parser');

// import * as express from 'express';

export class XMPLayServer {
  constructor(middleware) {
    const app = express();

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({ extended: true }));

    if (middleware) app.use(middleware);

    // app.use(function (err, req, res, next) {
    //   console.error(err.stack);
    //   res.status(500).send('Something blew up!');
    // });

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
