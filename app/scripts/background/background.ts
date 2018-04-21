// Enable chromereload by uncommenting this line:
// #if process.env.NODE_ENV === 'development'
import 'chromereload/devonly'
// #endif
import { MinaTopMessage, MessageType, NewStateMessage } from '../lib/MessageEvent'
import { Store } from './store/store';
import { State, initialState, UpdateCartAction, GroupChangeAction, OrderChangeAction, SelectGroupAction, AddGroupAction, AddOrderAction, CancelOrderAction, AddOrderSuccessAction, CancelOrderSuccessAction, ParticipateAction, RemoteCartUpdateAction, SendCartAction, RemoteCartRemoveAction, SignInSuccessAction, SignOutAction, LeaveGroupAction } from './store/actions';
import { Api, Events } from './api';
import * as Lockr from 'lockr';
import { Group } from '../lib/group';
import { Order } from '../lib/Order';
import { CartRecord, mergeCarts } from '../lib/cart';
import { ME } from '../lib/utils';
import { decodeCart, encodeCart } from '../lib/cookie';
import { Notifs } from '../lib/notifs';

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
  if (action.payload.key) Lockr.sadd('groups', action.payload.key);
  if (action.payload.currentOrder) {
    api.ensureOrder(action.payload.currentOrder, action.payload.key);
  }
}, GroupChangeAction)
store.addEffect(async (action: SelectGroupAction) => {
  if (action.payload)
    Lockr.set('selectedGroup', action.payload);
  else Lockr.rm('selectedGroup');
}, SelectGroupAction);
store.addEffect(async (action: AddGroupAction) => {
  api.ensureGroup(action.payload);
  return new SelectGroupAction(action.payload);
}, AddGroupAction);
store.addEffect(async (action: LeaveGroupAction) => {
  api.leaveGroup(action.payload);
  Lockr.srem('groups', action.payload);
  return new SelectGroupAction(null);
}, LeaveGroupAction);
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
  if (action.payload.total > 0) {
    chrome.browserAction.setBadgeText({ text: action.payload.total + '€' });
  } else {
    chrome.browserAction.setBadgeText({ text: '' });
  }
}, UpdateCartAction);



api.on(Events.GroupChange, (group: Group) => {
  if (group.currentOrder && (!store.value.groups[group.key] || group.currentOrder !== store.value.groups[group.key].currentOrder)) {
    onNewOrder(group);
  }
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
api.on(Events.SignIn, user => {
  console.log('Signed in with user', user)
  restoreFromLocalStorage();
  store.dispatch(new SignInSuccessAction());
});
api.on(Events.SignOut, user => {
  console.log('Signed out', user)
  store.dispatch(new SignOutAction());
});

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
      case MessageType.LeaveGroup:
        store.dispatch(new LeaveGroupAction(message.payload));
        break;
      case MessageType.Order:
        const carts = await api.listCarts(message.payload.key!);
        const cart = mergeCarts(carts);
        const cookie = encodeCart(cart);
        chrome.cookies.set({
          url: 'https://www.minato91.fr',
          name: cookieName,
          value: cookie,
        }, c => {
          if (c) chrome.tabs.create({
            url: 'https://www.minato91.fr/cmde_etap1.php',
          })
        })

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

chrome.cookies.onChanged.addListener(changeInfo => {
  if (changeInfo.cookie.name === cookieName && changeInfo.cookie.domain === 'www.minato91.fr') {
    if (changeInfo.cause === 'explicit')
      onUpdateCart(changeInfo.cookie.value);
    else if (changeInfo.removed)
      onEmptiedCart();
  }
})

chrome.cookies.get({
  url: "https://www.minato91.fr",
  name: cookieName,
}, cookie => cookie && onUpdateCart(cookie.value));

chrome.notifications.onClicked.addListener(id => {
  if (id === Notifs.NewOrder) {
    chrome.tabs.create({
      url: "https://www.minato91.fr",
    })
    chrome.notifications.clear(id);
  }
})

function onUpdateCart(cookie: string) {
  const cart = decodeCart(cookie);
  store.dispatch(new UpdateCartAction(cart));
}
function onEmptiedCart() {
  store.dispatch(new UpdateCartAction({ total: 0, items: [] }))
}

function onNewOrder(group: Group) {
  // notification
  chrome.notifications.create(Notifs.NewOrder, {
    type: 'basic',
    title: 'Commande en cours !',
    message: 'Une commande est en cours de préparation dans le groupe ' + group.key + ' !\nCliquez sur cette notification pour remplir votre panier.',
    contextMessage: group.key,
    iconUrl: 'images/icon-48.png',

  })
}
