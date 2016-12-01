require('electron-edge');
const trycatch = require('trycatch');
const dde = require('node-dde');
import { observable, computed, action } from 'mobx';
import XMPlayActions from './xmplay-actions';

export class XMPlay {
  static POLLING_INTERVAL = 5000;

  command;
  information;
  @observable isConnected = false;

  constructor() {
    this.command = dde.createClient('XMPlay', 'system');
    this.information = dde.createClient('XMPlay', 'info1');
  }

  @action connect() {
    let xmplay = this;

    trycatch(() => {
      this.command.connect();
      this.information.connect();

      this.isConnected = true;
    }, (err) => {
      setTimeout(xmplay.connect.bind(xmplay), XMPlay.POLLING_INTERVAL);

      console.log(`Couldn't connect to XMPlay, retry in ${ XMPlay.POLLING_INTERVAL / 1000 }s`, err.stack);
    });
  }

  isAction(action) {
    return !!XMPlayActions[action];
  }

  execute(action) {
    if (this.isAction(action))
      this.command.execute(XMPlayActions[action]);
    else
      throw new Error(`Can't execute an invalid action`);
  }

  queryTrackInfo() {
    return this.formatTrackInfo(this.information.request('info1'));
  }

//   pollTrackInfo()
// // Greet the World every second
// poll(() => new Promise(() => console.log('Hello World!')), 1000)

  formatTrackInfo(unformattedTrackInfo) {
    return unformattedTrackInfo.split('\n');
  }

  middleware(req, res, next) {
    trycatch(() => {
      if (req && req.body && req.body.action)
        this.execute(req.body.action);

      res.xmplayActionExecuted = true;
    }, () => {
      res.xmplayActionExecuted = false;
    });

    return next();
  }
}

export const xmplay = new XMPlay();


