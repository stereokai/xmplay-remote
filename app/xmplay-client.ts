import XMPlayActions from './xmplay-actions';
import * as io from 'socket.io-client';

export default class XMPlayClient {
  socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io('http://localhost:864');
  }

  static SERVER_URL = 'http://localhost:864/execute';
  isAction(action) {
    return !!XMPlayActions[action];
  }

  execute(action): Promise<any> {
    if (this.isAction(action)) {
      this.socket.emit('action', action);

      return fetch(XMPlayClient.SERVER_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
          action: action
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);

        return res;
      });
    } else {
      throw new Error(`Can't execute an invalid action`);
    }
  }
}