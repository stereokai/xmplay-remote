import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import XMPlayClient from './xmplay-client';
import XMPlayActions from './xmplay-actions';

@observer
class XMPlayRemote extends React.Component<{client: XMPlayClient}, {}> {
  client: XMPlayClient;

  get actions(): string[] {
    return Object.keys(XMPlayActions)
      .filter((property) => {
        return typeof XMPlayActions[property] === 'string';
      });
  }

  constructor(props) {
    super(props);

    this.client = props.client;
  }

  render() {
    return (
      <div>
        <div>{this.client.isConnected.toString()}</div>
        <div>title: {this.client.trackInfo.title} </div>
        <div>artist: {this.client.trackInfo.artist} </div>
        <div>album: {this.client.trackInfo.album} </div>
        <div>length: {this.client.trackInfo.length} </div>
        {this.actions.map((action) => {
          return <button key={action} onClick={() => this.onExecute(action)}>{action}</button>
        })}
        {/* <DevTools /> */}
      </div>
    );
  }

  onExecute(action: string) {
    this.client.execute(action);
  }
};

ReactDOM.render(
  <XMPlayRemote client={ new XMPlayClient() } />,
  document.getElementById('root')
);