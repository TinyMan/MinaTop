// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
import { MinaTopMessage, MessageType, NewStateMessage } from '../lib/MessageEvent'
import { Store } from './store/store';
import { State, initialState, UpdateCartAction, GroupChangeAction, OrderChangeAction, SelectGroupAction, AddGroupAction, AddOrderAction, CancelOrderAction, AddOrderSuccessAction, CancelOrderSuccessAction, ParticipateAction, RemoteCartUpdateAction, SendCartAction, RemoteCartRemoveAction } from './store/actions';
import { Api, Events } from './api';
import * as Lockr from 'lockr';
import { Group } from '../lib/group';
import { Order } from '../lib/Order';
import { CartRecord } from '../lib/cart';
import { ME } from '../lib/utils';
import { decodeCart } from '../lib/cookie';

const cookieName = '13222d2a2631002f2a262d37';
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
store.addEffect(async (action: GroupChangeAction) => {
  Lockr.sadd('groups', action.payload.key);
  if (action.payload.currentOrder)
    api.ensureOrder(action.payload.currentOrder, action.payload.key);
}, GroupChangeAction)
store.addEffect(async (action: SelectGroupAction) => {
  Lockr.set('selectedGroup', action.payload);
}, SelectGroupAction);
store.addEffect(async (action: AddGroupAction) => {
  api.ensureGroup(action.payload);
  return new SelectGroupAction(action.payload);
}, AddGroupAction);
store.addEffect(async (action: AddOrderAction) => {
  const order = await api.createOrder(action.group);
  return new AddOrderSuccessAction(order);
}, AddOrderAction);
store.addEffect(async (action: CancelOrderAction) => {
  await api.cancelOrder(action.payload.group, action.payload.key!);
  return new CancelOrderSuccessAction(action.payload);
}, CancelOrderAction);
store.addEffect(async (action: ParticipateAction) => {
  if (action.payload.participate)
    await api.sendCart({ order: action.payload.order, total: 0, items: [] });
  else await api.removeCart(action.payload.order);
}, ParticipateAction);
store.addEffect(async (action: SendCartAction) => {
  await api.sendCart({ order: action.order, ...store.value.cart });
}, SendCartAction);
store.addEffect(async (action: UpdateCartAction) => {
  chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
  chrome.browserAction.setBadgeText({ text: action.payload.total + '€' });
}, UpdateCartAction);



api.on(Events.GroupChange, (group: Group) => {
  store.dispatch(new GroupChangeAction(group));
})
api.on(Events.OrderChange, (order: Order) => {
  store.dispatch(new OrderChangeAction(order));
})
api.on(Events.CartChange, (cart: CartRecord) => {
  if (cart.key === ME) store.dispatch(new RemoteCartUpdateAction(cart));
})
api.on(Events.CartRemove, (order: string) => {
  store.dispatch(new RemoteCartRemoveAction(order));
})

/**
 * Restore state from local storage
 */
function restoreFromLocalStorage() {
  const groups = Lockr.smembers<string>('groups');
  groups.forEach(g => api.ensureGroup(g));

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
      case MessageType.CancelOrder:
        store.dispatch(new CancelOrderAction({ ...message.payload }));
        break;
      case MessageType.ToggleParticipate:
        store.dispatch(new ParticipateAction({ order: message.payload, participate: !(message.payload in store.value.remoteCarts) }));
        break;
      case MessageType.SendCart:
        store.dispatch(new SendCartAction(message.payload));
        break;
      default:
        callback('response')
        break;

    }
  } catch (e) {
    console.error(e);
  }
}
chrome.runtime.onMessage.addListener(dispatcher);

restoreFromLocalStorage();

chrome.cookies.onChanged.addListener(changeInfo => {
  if (changeInfo.cookie.name === cookieName && changeInfo.cookie.domain === 'www.minato91.fr' && changeInfo.cause === 'explicit') {
    onUpdateCart(changeInfo.cookie.value);
  }
})

chrome.cookies.get({
  url: "http://www.minato91.fr",
  name: cookieName,
}, cookie => cookie && onUpdateCart(cookie.value));

function onUpdateCart(cookie: string) {
  const cart = decodeCart(cookie);
  store.dispatch(new UpdateCartAction(cart));
}
