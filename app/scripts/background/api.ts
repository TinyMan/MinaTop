
import * as firebase from "firebase";
import 'firebase/firestore';
import { firebase as fbConf } from './config'
import { Order } from "../lib/Order";
import { Cart } from "../lib/cart";
import { EventEmitter } from "events";

export const Events = {
  SignIn: Symbol(),
  SignOut: Symbol(),

  GroupChange: Symbol(),

}
export class Api extends EventEmitter {

  private _db: null | firebase.firestore.Firestore = null;
  public get db() {
    if (!this._db && !this.signing)
      return this.signIn().then(db => {
        if (!db) throw new Error('Cannot get firestore')
        else return db;
      });
    else if (this.signing) return this.signing;
    return Promise.resolve(this._db!);
  }

  private signing: Promise<firebase.firestore.Firestore>;

  private groups = new Map<string, firebase.firestore.DocumentReference>();
  private groupUnsubscribers = new Map<string, () => void>();

  constructor() {
    super();
    (window as any).api = this;
    firebase.initializeApp(fbConf);
    firebase.auth().onAuthStateChanged(user => {
      if (user && !this._db) {
        this._db = firebase.firestore();
      } else if (!user) {
        this.signIn();
      }

    });
  }
  public async addGroup(group: string) {
    if (!this.groups.has(group)) {
      const db = await this.db;
      const doc = db.collection('groups').doc(group);
      this.groups.set(group, doc);
      this.groupUnsubscribers.set(group, doc.onSnapshot(this.onGroupSnapshot.bind(this)));
    }
  }
  public async onGroupSnapshot(group: firebase.firestore.DocumentSnapshot) {
    this.emit(Events.GroupChange, group.data());
  }

  public async signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      this.signing = (async () => {

        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        const result = await firebase.auth().signInWithPopup(provider)
        this._db = firebase.firestore();
        this.emit(Events.SignIn);
        return this._db;
      })();
      return await this.signing;
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
      return null;
    }
  }

  async sendCart(group: string, order: string, cart: Cart) {
    const db = await this.db;
    return await db.collection('groups').doc(group)
      .collection('orders').doc(order)
      .collection('carts').doc(firebase.auth().currentUser!.uid)
      .set(cart);
  }

  async fulfillOrder(group: string, order: string) {
    const db = await this.db;
    return await db.collection('groups').doc(group)
      .collection('orders').doc(order)
      .update({
        fulfilled: true
      })
  }

  async createOrder(group: string, order: Order) {
    const db = await this.db;
    await db.collection('groups').doc(group).collection('orders').add(order);

    return order;
  }
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
