// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
import { MinaTopMessage, MessageType } from '../lib/MessageEvent'

chrome.runtime.onInstalled.addListener((details) => {
  // updated
  console.log('Updated', details)
});

chrome.runtime.onMessageExternal.addListener((message: MinaTopMessage, sender, callback) => {
  switch (message.type) {
    case MessageType.CartUpdate:
      console.log(message.payload);
      break;
    case MessageType.Echo:
      callback(message.payload);
      break;
    default:
      callback('response')
      break;

  }
});
