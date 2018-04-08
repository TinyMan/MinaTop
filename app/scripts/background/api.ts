
import * as firebase from "firebase";
import 'firebase/firestore';
import { firebase as fbConf } from './config'
import { Order } from "../lib/Order";

let db: firebase.firestore.Firestore | null = null;

const provider = new firebase.auth.GoogleAuthProvider();

firebase.initializeApp(fbConf);
firebase.auth().onAuthStateChanged(user => {
  if (user && !db) {
    callback();
  } else if (!user) {
    initFirestore();
  }

});

function callback() {
  db = firebase.firestore();
  // testFB()
}

async function initFirestore() {
  try {
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    const result = await firebase.auth().signInWithPopup(provider)
    callback();
  } catch (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    alert(error);
  }
}



export async function assertDb() {
  if (db && firebase.auth().currentUser) return db;
  await initFirestore();
  return db!;
}

export async function createOrder(group: string, order: Order) {
  const db = await assertDb();
  await db.collection('groups').doc(group).collection('orders').add(order);

  return order;
}

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
