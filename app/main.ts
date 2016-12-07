
import { app } from './electron';
const trycatch = require('trycatch');
import { xmplay } from './xmplay';
import { filebrowser } from './filebrowser';
import { autorun, when, reaction } from 'mobx';

class Main {
  constructor() {
    let io:SocketIO.Server;
    const main = this;

    xmplay.onDisconnect(() => {
      main.notifyXMPlayStatus(io);
    });

    xmplay.onConnect(() => {
      main.notifyXMPlayStatus(io);
    });

    app.on('ready', () => {
      io = require('socket.io')('864');
      io.on('connection', this.server.bind(this));
      xmplay.connect();
    });

    app.on('window-all-closed', () => {
      xmplay.disconnect();
      io.close();
    });


  }

  notifyXMPlayStatus(io: SocketIO.Server | SocketIO.Socket) {
    io.emit('status', {
      isXMPlayConnected: xmplay.isConnected
    });
  }

  server(socket: SocketIO.Socket) {
    this.notifyXMPlayStatus(socket);

    socket.on('action', (action) => {
      trycatch(() => {
        xmplay.execute(action);
      }, () => {
        socket.emit('status', {
          error: 'Unrecognized command'
        });
      })
    });

    autorun(() => {
      socket.emit('track-info', {
        title: xmplay.trackInfo.title,
        artist: xmplay.trackInfo.artist,
        album: xmplay.trackInfo.album,
        length: xmplay.trackInfo.length
      });
    });
  }

  async getFiles() {
    console.log(await filebrowser.getItemsInFolder('C:/Users/Tom/Downloads/The Book Of Souls'))
  }
}
new Main();