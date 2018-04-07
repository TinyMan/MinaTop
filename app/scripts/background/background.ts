// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
import { MinaTopMessage, MessageType, NewStateMessage } from '../lib/MessageEvent'
import { Store } from './store/store';
import { State, initialState, UpdateCartAction } from './store/actions';

chrome.runtime.onInstalled.addListener((details) => {
  // updated
  console.log('Updated', details)
});

const store = new Store<State>(initialState);
store.subscribe(state => {
  console.log(state);
  chrome.runtime.sendMessage(new NewStateMessage(state));
})

function dispatcher(message: MinaTopMessage, sender: chrome.runtime.MessageSender, callback: (response: any) => void) {
  switch (message.type) {
    case MessageType.UpdateCart:
      console.log(message.payload);
      store.dispatch(new UpdateCartAction(message.payload));
      break;
    case MessageType.Echo:
      callback(message.payload);
      break;
    case MessageType.GetState:
      callback(store.value);
      break;
    default:
      callback('response')
      break;

  }
}
chrome.runtime.onMessageExternal.addListener(dispatcher);
chrome.runtime.onMessage.addListener(dispatcher);

