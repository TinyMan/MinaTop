// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
import { MinaTopMessage, MessageType, NewStateMessage } from '../lib/MessageEvent'
import { Store } from './store/store';
import { State, initialState, UpdateCartAction, GroupChangeAction, OrderChangeAction, SelectGroupAction, AddGroupAction, AddOrderAction } from './store/actions';
import { Api, Events } from './api';
import * as Lockr from 'lockr';
import { Group } from '../lib/group';
import { Order } from '../lib/Order';

const api = new Api();

/**
 * STORE
 */
const store = new Store<State>(initialState);
store.subscribe(state => {
  console.log("New state: ", state);
  chrome.runtime.sendMessage(new NewStateMessage(state));
})

/**
 * Side Effects
 */
store.addEffect((action: GroupChangeAction) => {
  Lockr.sadd('groups', action.payload.key);
  if (action.payload.currentOrder)
    api.addOrder(action.payload.key, action.payload.currentOrder);
}, GroupChangeAction)
store.addEffect((action: SelectGroupAction) => {
  Lockr.set('selectedGroup', action.payload);
}, SelectGroupAction);
store.addEffect((action: AddGroupAction) => {
  api.addGroup(action.payload);
  return new SelectGroupAction(action.payload);
}, AddGroupAction);
store.addEffect((action: AddOrderAction) => {
  api.createOrder(action.group);
}, AddOrderAction);

api.on(Events.GroupChange, (group: Group) => {
  store.dispatch(new GroupChangeAction(group));
})
api.on(Events.OrderChange, (order: Order) => {
  store.dispatch(new OrderChangeAction(order));
})

/**
 * Restore state from local storage
 */
function restoreFromLocalStorage() {
  const groups = Lockr.smembers<string>('groups');
  groups.forEach(g => api.addGroup(g));

  const selectedGroup = Lockr.get<string>('selectedGroup');
  store.dispatch(new SelectGroupAction(selectedGroup));
}




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
        store.dispatch(new AddOrderAction(message.group));
        // const order = await api.createOrder(store.value.selectedGroup, { author: 'TinyMan', expiration: Date.now() + 1000 * 60 * 120, fulfilled: false });
        // console.log('Order created', order);
        break;
      case MessageType.AddGroup:
        store.dispatch(new AddGroupAction(message.payload));
        break;
      case MessageType.SelectGroup:
        store.dispatch(new SelectGroupAction(message.payload));
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

restoreFromLocalStorage();
