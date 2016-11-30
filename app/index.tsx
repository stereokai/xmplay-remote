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
  @observable status = '';

  get actions(): string[] {
    return Object.keys(XMPlayActions);
  }

  constructor(props) {
    super(props);

    this.client = props.client;
  }

  render() {
    return (
      <div>
        <div>{this.status}</div>
        {this.actions.map((action) => {
          return <button key={action} onClick={() => this.onExecute(action)}>{action}</button>
        })}
        {/* <DevTools /> */}
      </div>
    );
  }

  onExecute(action: string) {
    this.props.client.execute(action)
      .then(() => {
        this.status = 'cool';
      })
      .catch(() => {
        this.status = 'not cool'
      });
  }
};

ReactDOM.render(
  <XMPlayRemote client={ new XMPlayClient() } />,
  document.getElementById('root')
);