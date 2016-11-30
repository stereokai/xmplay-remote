
import { app } from './electron';
import XMPlayServer from './xmplay-server';
import { xmplay } from './xmplay';
import { autorun, when } from 'mobx';

class Main {
  constructor() {
    let server, disposer;

    disposer = when(
      () => xmplay.isConnected,
      () => {
        disposer();
        server = new XMPlayServer(xmplay.middleware.bind(xmplay));
      }
    );

    app.on('ready', () => {
      xmplay.connect();
    });

    app.on('window-all-closed', () => {
      server.close();
    });
  }
}

new Main();