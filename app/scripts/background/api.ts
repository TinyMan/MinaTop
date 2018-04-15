
import * as firebase from "firebase";
import 'firebase/firestore';
import { firebase as fbConf } from './config'
import { Order } from "../lib/Order";
import { Cart } from "../lib/cart";
import { EventEmitter } from "events";
import { Group } from "../lib/group";
import { ME } from "../lib/utils";

export const Events = {
  SignIn: Symbol(),
  SignOut: Symbol(),

  GroupChange: Symbol(),
  OrderChange: Symbol(),

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

  private orders = new Map<string, firebase.firestore.DocumentReference>();
  private orderUnsubscribers = new Map<string, () => void>();

  constructor() {
    super();
    (window as any).api = this;
    firebase.initializeApp(fbConf);
    this.signing = new Promise((res, rej) => {
      firebase.auth().onAuthStateChanged(user => {
        if (user && !this._db) {
          this._db = firebase.firestore();
          res(this._db);
        } else if (!user) {
          this.signIn()
        }

      });
    });
  }
  public async ensureGroup(group: string) {
    let groupRef = this.groups.get(group);
    if (!groupRef) {
      const db = await this.db;
      groupRef = db.collection('groups').doc(group);
      this.groups.set(group, groupRef);
      this.groupUnsubscribers.set(group, groupRef.onSnapshot(this.onGroupSnapshot.bind(this)));
    }
    return groupRef;
  }
  public async ensureOrder(group: string, order: string) {
    let orderRef = this.orders.get(order);
    if (!orderRef) {
      const db = await this.db;
      const groupRef = await this.ensureGroup(group);
      orderRef = groupRef.collection('orders').doc(order);
      this.orders.set(order, orderRef);
      this.orderUnsubscribers.set(order, orderRef.onSnapshot(this.onOrderSnapshot.bind(this)));
    }
    return orderRef;
  }
  public async onGroupSnapshot(group: firebase.firestore.DocumentSnapshot) {
    const data = group.data();
    if (data) {
      const g: Group = {
        key: group.id,
        currentOrder: data.currentOrder
      }
      this.emit(Events.GroupChange, g);
    }
  }
  public async onOrderSnapshot(order: firebase.firestore.DocumentSnapshot) {
    const data = order.data();
    if (data) {
      const g: Order = {
        ...data,
        group: order.ref.parent.parent!.id,
        author: data.author === firebase.auth().currentUser!.uid ? ME : data.author,
        key: order.id,
      } as Order;
      this.emit(Events.OrderChange, g);
    }
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

  async createOrder(group: string, {
    expiration = Date.now() + 1000 * 60 * 120,
    fulfilled = false,
    cancelled = false,
  }: Partial<Order> = {}) {
    const db = await this.db;
    const o: Order = {
      expiration,
      fulfilled,
      cancelled,
      group,
      authorName: firebase.auth().currentUser!.displayName || '',
      author: firebase.auth().currentUser!.uid,
    };
    const ref = await db.collection('groups').doc(group).collection('orders').add(o);

    return o;
  }
  async cancelOrder(group: string, order: string) {
    const db = await this.db;
    console.log('Cancel order', group, order);
    const orderRef = await this.ensureOrder(group, order);
    return await orderRef.update({
      cancelled: true
    });
  }
}
