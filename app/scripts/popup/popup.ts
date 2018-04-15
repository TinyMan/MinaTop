// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'

import { render } from 'lit-html';
import { MinaTopMessage, MessageType, GetStateMessage } from '../lib/MessageEvent';
import { popup, expiration } from './template';
import { State } from '../background/store/actions';

const renderPopup = (() => {
  const el = document.getElementById('popup')!;
  let lastState;
  return (state?: State) => {
    render(popup(state ? state : lastState), el);
    lastState = state;
  }
})()

chrome.runtime.onMessage.addListener((message: MinaTopMessage, sender, callback) => {
  switch (message.type) {
    case MessageType.NewState:
      console.log('new state available: ', message.payload);
      renderPopup(message.payload);
      break;
    default: break;
  }
})

chrome.runtime.sendMessage(new GetStateMessage(), renderPopup);

setInterval(() => {
  const els = document.getElementsByClassName('expiration-value');
  for (let i = 0; i < els.length; i++) {
    const el = els.item(i);
    const expAttr = el.attributes.getNamedItem('data-expiration');
    if (expAttr) {
      const exp = parseInt(expAttr.value, 10);
      render(expiration(exp), el);
    }
  }
}, 1000);
