require('electron-edge');
const trycatch = require('trycatch');
const dde = require('node-dde');
import { when, reaction, transaction, extendObservable, observable, action } from 'mobx';
import XMPlayActions from './xmplay-actions';

interface AvailableTrackInfo {
  title: string;
  file: string;
  path: string;
  size: string;
  subsong: string;
  format: string;
  'sample rate': string;
  'bit rate': string;
  channels: string;
  length: string;
  output: string;
  artist: string;
  '0:00': string;
}

export interface TrackInfo {
  title?: string;
  artist?: string;
  album?: string;
  length?: string;
}

export class XMPlay {
  static POLLING_INTERVAL = 5000;

  command;
  info;
  isEnabled = false;
  @observable isConnected = false;
  @observable trackInfo: TrackInfo = {
    title: '',
    artist: '',
    album: '',
    length: ''
  };

  constructor() {
    this.command = dde.createClient('XMPlay', 'system');
    this.info = dde.createClients({
      XMPlay: {
        info0: ['info'],
        info1: ['info']
      }
    });

    // We don't want to have partial operation.
    // If any of the DDE clients fail, restart.
    this.command.on('disconnected', () => {
      this._disconnect();
    });

    this.info.on('disconnected', () => {
      this._disconnect();
    });

    // Auto reconnect
    this.onDisconnect(() => {
      !!this.isEnabled && this.connect();
    });

    this.onConnect(() => {
      this.trackInfoLoop();
    })
  }

  @action connect() {
    const xmplay = this;

    if (this.isConnected) return;

    this.isEnabled = true;

    trycatch(() => {
      this.command.connect();
      this.info.connect();

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

    if (this.info.isConnected())
      this.info.disconnect();

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

  trackInfoLoop() {
    if (this.isConnected) {
      this.queryTrackInfo();
      setTimeout(this.trackInfoLoop.bind(this), XMPlay.POLLING_INTERVAL);
    }
  }

  @action queryTrackInfo() {
    let phase1, phase2;

    trycatch(
      () => {
        let allInfo = this.info.request();

        phase1 = this.formatTrackInfo(allInfo[0].result);
        phase2 = this.formatTrackInfo(allInfo[1].result);

        transaction(() => {
          this.trackInfo.title = phase1.title;
          this.trackInfo.artist = phase2.artist;
          this.trackInfo.album = phase2.title;
          this.trackInfo.length = phase1.length;
        });
      },
      err => err // We ignore this error, but must pass a fn to node-dde
    );
  }

  formatTrackInfo(unformattedTrackInfo: string): AvailableTrackInfo {
    return unformattedTrackInfo
      .split('\n')
      .reduce((info, infoPart: string) => {
        const infoTuple = infoPart.split('\t');
        info[infoTuple[0].toLowerCase()] = infoTuple[1];
        return info;
      }, <AvailableTrackInfo>{});
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


