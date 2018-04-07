// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'

import { render } from 'lit-html';
import { MinaTopMessage, MessageType, GetStateMessage } from '../lib/MessageEvent';
import { popup } from './template';
import { State } from '../background/store/actions';

const renderPopup = (() => {
  const el = document.getElementById('popup')!;
  return (state: State) => render(popup(state), el)
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
