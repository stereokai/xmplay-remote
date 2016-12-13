const edge = require('electron-edge');
const dde = require('electron-node-dde');
const trycatch = require('trycatch');
import './unicode-extensions';
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
  static SUPPORTED_EXTENSIONS = /(^aac$|^ac3$|^aif$|^aiff$|^alac$|^ape$|^cda$|^cue$|^dff$|^dsf$|^flac$|^it$|^kar$|^m3u$|^m4a$|^m4b$|^mid$|^midi$|^mod$|^mpc$|^mpp$|^mtm$|^mus$|^ofr$|^ofs$|^oga$|^ogg$|^pls$|^psid$|^ra$|^ram$|^rm$|^rmi$|^rmm$|^rsid$|^s3m$|^sid$|^umx$|^wav$|^wax$|^wma$|^wv$|^xm$|^xmi$)/;

  isEnabled = false;
  @observable isConnected = false;
  @observable trackInfo: TrackInfo = {
    title: '',
    artist: '',
    album: '',
    length: ''
  };

  private command;
  private info;
  private _getPlaylist: Function;

  constructor() {
    this.setupWin32Interface();
    this.setupDDEInterface();
  }

  //----------------------------------*\
  // DDE Interface
  //----------------------------------*/

  private setupDDEInterface() {
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
    });
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

    this.isEnabled = false;
    this._disconnect();
  }

  @action private _disconnect() {
    console.log('disco')
    if (this.isConnected === false) return;

    if (this.command.isConnected())
      this.command.disconnect();

    if (this.info.isConnected())
      this.info.disconnect();

    this.isConnected = false;
  }

  @action execute(action: string) {
    trycatch(() => {
      if (XMPlayActions.isAction(action)) {
        if (XMPlayActions.FILE_ACTION_REGEX.test(action)) {
          this.command.execute(action);
        } else {
          this.command.execute(XMPlayActions[action]);
        }
      } else throw new Error(`Can't execute an invalid action`);
    }, () => {
      this.isConnected = false;
    });
  }

  playFile(file) {
    this.execute(`[open(${file})]`);
  }

  queueFile(file) {
    this.execute(`[list(${file})]`);
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

        this.trackInfo.title = phase1.title;
        this.trackInfo.artist = phase2.artist;
        this.trackInfo.album = phase2.title;
        this.trackInfo.length = phase1.length;
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
        !!isConnected && callback();
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


  //----------------------------------*\
  // Win32 Interface
  //----------------------------------*/

  private setupWin32Interface() {
    const settings = {
      source: require('path').join(__dirname, '../app/xmplay-win32.cs'),
      typeName: 'XMPlayInterface.XMPlayController',
    }

    const getPlaylist = edge.func({
      ...settings,
      methodName: 'getPlaylist'
    });

    const getPlayingStatus = edge.func({
      ...settings,
      methodName: 'getPlayingStatus'
    });

    const getElapsedTime = edge.func({
      ...settings,
      methodName: 'getElapsedTime'
    });

    getPlaylist({ x: 10 }, (error, result) => {
      console.log((<string[]>result).map((name) => {
        const uni = name.toUnicode();

        return uni.substring(0, uni.indexOf('\\u0000')).fromUnicode();
      }));

      if (error) throw error;
    });

    getElapsedTime({ x: 10 }, (error, result) => {
      console.log('elapsed time:', result);
      if (error) throw error;
    });

    getPlayingStatus({ x: 10 }, (error, result) => {
      console.log('status:', result);
      if (error) throw error;
    });
  }
}

export const xmplay = new XMPlay();
