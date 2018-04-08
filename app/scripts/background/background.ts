// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
import { MinaTopMessage, MessageType, NewStateMessage } from '../lib/MessageEvent'
import { Store } from './store/store';
import { State, initialState, UpdateCartAction } from './store/actions';
import * as firebase from "firebase";
import 'firebase/firestore';
import { firebase as fbConf } from './config'

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



async function testFB() {
  // console.log(firebase);
  const db = firebase.firestore();

  const w = window as any;
  w.test = testFB;
  w.fb = firebase;
  w.db = db;
  const groups = w.groups = db.collection('groups')
  const orders = w.orders = groups.doc('Groupe INNOV').collection('orders');


  try {
    const doc = await db.collection("groups").doc('Groupe INNOV').get();
    console.log(doc.id, ' => ', doc.data())
  } catch (e) {
    console.error(e);
  }

  const list = await db.collection("groups").get();
  console.log(list);
}


var provider = new firebase.auth.GoogleAuthProvider();

firebase.initializeApp(fbConf);
firebase.auth().signInWithPopup(provider).then(function (result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  console.log(token, user);

  testFB();

}).catch(function (error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
  alert(error);
});
