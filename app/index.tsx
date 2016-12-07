import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import XMPlayClient from './xmplay-client';
import XMPlayActions from './xmplay-actions';
import * as Dropzone from 'react-dropzone';

@observer
class XMPlayRemote extends React.Component<{client: XMPlayClient}, {shouldQueue: boolean}> {
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
    this.state = { shouldQueue: false };
  }

  render() {
    return (
      <div>
        <div>
          <label>
            <input type="radio" value="play" checked={!this.state.shouldQueue} onChange={this.onPlayMethodChange.bind(this)} />
            Play files
          </label>
          <label>
            <input type="radio" value="queue" checked={this.state.shouldQueue} onChange={this.onPlayMethodChange.bind(this)} />
            Queue files
          </label>
        </div>
        <Dropzone onDrop={this.onDrop.bind(this)}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>
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

  onDrop (files: any[]) {
    files.forEach((file) => {
      if (this.state.shouldQueue) {
        this.client.queueFile(file.path);
      } else {
        this.client.playFile(file.path);
      }
    })
    console.log('Received files: ', files);
  }

  onPlayMethodChange(e: React.FormEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement;

    this.setState({
      shouldQueue: target.value === 'play' ? false : true
    });
  }
};

ReactDOM.render(
  <XMPlayRemote client={ new XMPlayClient() } />,
  document.getElementById('root')
);