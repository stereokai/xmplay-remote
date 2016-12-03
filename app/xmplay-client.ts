import XMPlayActions from './xmplay-actions';
import * as io from 'socket.io-client';
import { action, observable, transaction } from 'mobx';
import { TrackInfo } from './xmplay';

export default class XMPlayClient {
  static SERVER_URL = 'http://localhost:864/execute';

  private socket: SocketIOClient.Socket;

  @observable public isConnected = false;
  @observable public trackInfo: TrackInfo = {
    title: '',
    artist: '',
    album: '',
    length: ''
  };

  constructor() {
    this.socket = io('http://localhost:864');

    this.socket.on('status', this.onStatus.bind(this));
    this.socket.on('track-info', this.onTrackChange.bind(this));
  }

  execute(action) {
    if (XMPlayActions.isAction(action)) {
      this.socket.emit('action', action);
    } else {
      throw new Error(`Can't execute an invalid action`);
    }
  }

  @action private onStatus(newState) {
    if (typeof newState.isXMPlayConnected === 'boolean') {
      this.isConnected = newState.isXMPlayConnected;
    }
  }

  @action private onTrackChange(trackInfo: TrackInfo) {
    transaction(() => {
      this.trackInfo.title = trackInfo.title;
      this.trackInfo.artist = trackInfo.artist;
      this.trackInfo.album = trackInfo.album;
      this.trackInfo.length = trackInfo.length;
    });
  }
}