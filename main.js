const electron = require('./dist/electron');
const xmplay = require('./dist/xmplay-server');

const { app } = electron;
let server;

app.on('ready', () => {
  server = new xmplay.XMPLayServer();
});

app.on('window-all-closed', () => {
  server.close();
})