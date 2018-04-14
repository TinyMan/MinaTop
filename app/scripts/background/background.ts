// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
import { MinaTopMessage, MessageType, NewStateMessage } from '../lib/MessageEvent'
import { Store } from './store/store';
import { State, initialState, UpdateCartAction, GroupChangeAction, OrderChangeAction } from './store/actions';
import { Api, Events } from './api';
import * as Lockr from 'lockr';
import { Group } from '../lib/group';
import { Order } from '../lib/Order';

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
  console.log("New state: ", state);
  chrome.runtime.sendMessage(new NewStateMessage(state));
})

store.addEffect((state, action: GroupChangeAction) => {
  Lockr.sadd('groups', action.payload.key);
  api.addOrder(action.payload.key, action.payload.currentOrder);
}, GroupChangeAction)

api.on(Events.GroupChange, (group: Group) => {
  store.dispatch(new GroupChangeAction(group));
})
api.on(Events.OrderChange, (order: Order) => {
  store.dispatch(new OrderChangeAction(order));
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
        // const order = await api.createOrder(store.value.selectedGroup!, { author: 'TinyMan', expiration: Date.now() + 1000 * 60 * 120, fulfilled: false });
        // console.log('Order created', order);
        break;
      case MessageType.AddGroup:
        api.addGroup(message.payload);
        break;

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






