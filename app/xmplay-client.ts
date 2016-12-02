import XMPlayActions from './xmplay-actions';
import * as io from 'socket.io-client';
import { action, observable } from 'mobx';

export default class XMPlayClient {
  static SERVER_URL = 'http://localhost:864/execute';

  private socket: SocketIOClient.Socket;
  @observable isConnected = false;

  constructor() {
    this.socket = io('http://localhost:864');

    this.socket.on('status', this.onStatus.bind(this));
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
}