// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'

import { html, render } from 'lit-html';
import { MinaTopMessage, EchoMessage } from '../lib/MessageEvent';

var a = html`
  <span></span>
`

chrome.runtime.onMessage.addListener((message: MinaTopMessage, sender, callback) => {

  console.log(message);
  callback('ok');
})

chrome.runtime.sendMessage(new EchoMessage('salut'), e => console.log('response: ', e))
