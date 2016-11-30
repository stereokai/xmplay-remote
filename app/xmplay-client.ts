import XMPlayActions from './xmplay-actions';

export default class XMPlayClient {
  isAction(action) {
    return !!XMPlayActions[action];
  }

  execute(action): Promise<any> {
    if (this.isAction(action)) {
      return fetch("http://localhost:864/execute", {
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