require('electron-edge');
const trycatch = require('trycatch');
const dde = require('node-dde');
import { when, reaction, observable, action } from 'mobx';
import XMPlayActions from './xmplay-actions';

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
}

export class XMPlay {
  static POLLING_INTERVAL = 5000;

  command;
  information;
  isEnabled = false;
  @observable isConnected = false;
  @observable lastTrackInfo: TrackInfo = {
    title: '',
    artist: '',
    album: ''
  };

  constructor() {
    this.command = dde.createClient('XMPlay', 'system');
    this.information = dde.createClient('XMPlay', 'info1');

    // We don't want to have partial operation.
    // If any of the DDE clients fail, restart.
    this.command.on('disconnected', () => {
      this._disconnect();
    });

    this.information.on('disconnected', () => {
      this._disconnect();
    });

    // Auto reconnect
    this.onDisconnect(() => {
      !!this.isEnabled && this.connect();
    });
  }

  @action connect() {
    const xmplay = this;

    if (this.isConnected) return;

    this.isEnabled = true;

    trycatch(() => {
      this.command.connect();
      this.information.connect();

      this.isConnected = true;
    }, (err) => {
      setTimeout(xmplay.connect.bind(xmplay), XMPlay.POLLING_INTERVAL);

      console.log(`Couldn't connect to XMPlay, retry in ${ XMPlay.POLLING_INTERVAL / 1000 }s`, err.stack);
    });
  }

  disconnect() {
    if (this.isConnected === false) return;

    this._disconnect();
    this.isEnabled = false;
  }

  @action private _disconnect() {
    if (this.isConnected === false) return;

    if (this.command.isConnected())
      this.command.disconnect();

    if (this.information.isConnected())
      this.information.disconnect();

    this.isConnected = false;
  }

  @action execute(action) {
    trycatch(() => {
      if (XMPlayActions.isAction(action))
        this.command.execute(XMPlayActions[action])
      else
        throw new Error(`Can't execute an invalid action`);
    }, () => {
      this.isConnected = false;
    });
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

  onConnect(callback) {
    reaction(
      () => this.isConnected,
      (isConnected) => {
        isConnected && callback();
      }
    );
  }

  onDisconnect(callback) {
    reaction(
      () => this.isConnected,
      (isConnected) => {
        !isConnected && callback();
      }
    );
  }
}

export const xmplay = new XMPlay();


