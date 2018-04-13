// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
import { MinaTopMessage, MessageType, NewStateMessage } from '../lib/MessageEvent'
import { Store } from './store/store';
import { State, initialState, UpdateCartAction } from './store/actions';
import { Api } from './api';
import * as Lockr from 'lockr';

const api = new Api();

/**
 * SETUP GROU LISTENERS
 */
const groups = Lockr.smembers<string>('groups');
groups.forEach(g => api.addGroup(g));


/**
 * STORE
 */
const store = new Store<State>(initialState);
store.subscribe(state => {
  console.log(state);
  chrome.runtime.sendMessage(new NewStateMessage(state));
})


/**
 * Messages management
 */
async function dispatcher(message: MinaTopMessage, sender: chrome.runtime.MessageSender, callback: (response: any) => void) {
  try {
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
      case MessageType.CreateOrder:
        const order = await api.createOrder(store.value.selectedGroup!, { author: 'TinyMan', expiration: Date.now() + 1000 * 60 * 120, fulfilled: false });
        console.log('Order created', order);
        break;
      case MessageType.AddGroup:
        api.addGroup(message.payload);
        Lockr.sadd('groups', message.payload);
        break;
      case MessageType.SelectGroup:

      default:
        callback('response')
        break;

    }
  } catch (e) {
    console.error(e);
  }
}
chrome.runtime.onMessageExternal.addListener(dispatcher);
chrome.runtime.onMessage.addListener(dispatcher);






