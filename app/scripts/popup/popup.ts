// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'

import { render } from 'lit-html';
import { MinaTopMessage, EchoMessage } from '../lib/MessageEvent';
import { popup } from './template';
import { State } from '../background/store/actions';

chrome.runtime.onMessage.addListener((message: MinaTopMessage, sender, callback) => {

  console.log(message);
  callback('ok');
})

chrome.runtime.sendMessage(new EchoMessage('salut'), e => console.log('response: ', e))

const el = document.getElementById('popup');
if (el)
  render(popup({} as State), el);
