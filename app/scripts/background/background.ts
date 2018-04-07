// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
import { MinaTopMessage, MessageType } from '../lib/MessageEvent'
import { Store } from './store/store';
import { State, initialState, UpdateCartAction } from './store/actions';

chrome.runtime.onInstalled.addListener((details) => {
  // updated
  console.log('Updated', details)
});

const store = new Store<State>(initialState);
store.subscribe(state => {
  console.log(state);
})


chrome.runtime.onMessageExternal.addListener((message: MinaTopMessage, sender, callback) => {
  switch (message.type) {
    case MessageType.CartUpdate:
      console.log(message.payload);
      store.dispatch(new UpdateCartAction(message.payload));
      break;
    case MessageType.Echo:
      callback(message.payload);
      break;
    default:
      callback('response')
      break;

  }
});

