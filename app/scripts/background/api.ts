
import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/auth';
import { firebase as fbConf } from './config'
import { Order } from "../lib/Order";
import { Cart, CartRecord } from "../lib/cart";
import { EventEmitter } from "events";
import { Group } from "../lib/group";
import { ME } from "../lib/utils";

export const Events = {
  SignIn: Symbol(),
  SignOut: Symbol(),

  GroupChange: Symbol(),
  OrderChange: Symbol(),
  CartChange: Symbol(),
  CartRemove: Symbol(),
  OrderRemove: Symbol(),

}
export class Api extends EventEmitter {

  private _db: null | firebase.firestore.Firestore = null;
  public get db() {
    if (!this.signedin) throw new Error('You must sign in before using firestore api');
    return Promise.resolve(this._db!);
  }


  private groups = new Map<string, firebase.firestore.DocumentReference>();
  private groupUnsubscribers = new Map<string, () => void>();

  private orders = new Map<string, firebase.firestore.DocumentReference>();
  private orderUnsubscribers = new Map<string, () => void>();
  private cartUnsubscribers = new Map<string, () => void>();

  public get signedin() { return !!this._db }

  constructor() {
    super();
    (window as any).api = this;
    firebase.initializeApp(fbConf);
    firebase.auth().onAuthStateChanged(user => {
      if (user && !this._db) {
        this._db = firebase.firestore();
        const settings = { timestampsInSnapshots: true };
        this._db.settings(settings);
        setTimeout(() => this.emit(Events.SignIn, user), 0);
      } else if (!user) {
        this._db = null;
        this.emit(Events.SignOut);
      }
    });
  }

  public leaveGroup(group: string) {
    if (this.groups.has(group)) {
      this.groups.delete(group);
    }
    if (this.groupUnsubscribers.has(group)) {
      this.groupUnsubscribers.get(group)!();
      this.groupUnsubscribers.delete(group);
    }
  }
  public async ensureGroup(group: string) {
    if (!group) throw new Error('group cannot be null');
    let groupRef = this.groups.get(group);
    if (!groupRef) {
      const db = await this.db;
      groupRef = db.collection('groups').doc(group);
      this.groups.set(group, groupRef);
      this.groupUnsubscribers.set(group, groupRef.onSnapshot(this.onGroupSnapshot.bind(this)));
    }
    return groupRef;
  }
  public async ensureOrder(order: string, group?: string) {
    let orderRef = this.orders.get(order);
    if (!orderRef) {
      if (!group) throw new Error('Order not found and group not filled');
      const groupRef = await this.ensureGroup(group);
      orderRef = groupRef.collection('orders').doc(order);
      this.orders.set(order, orderRef);
      this.cartUnsubscribers.set(order, orderRef.collection('carts').doc(firebase.auth().currentUser!.uid).onSnapshot({ includeMetadataChanges: false }, { next: this.onCartSnapshot.bind(this) }));
      this.orderUnsubscribers.set(order, orderRef.onSnapshot(this.onOrderSnapshot.bind(this), e => {
        // on error
        const uns = this.orderUnsubscribers.get(order);
        const cart = this.cartUnsubscribers.get(order);
        // unsubscribe
        if (uns) uns();
        if (cart) cart();
        this.orderUnsubscribers.delete(order);
        this.cartUnsubscribers.delete(order);
        this.orders.delete(order);
        this.emit(Events.OrderRemove, order);
      }));
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
  public async onCartSnapshot(cart: firebase.firestore.DocumentSnapshot) {
    const data = cart.data() as Cart;
    if (data) {
      const o: CartRecord = {
        ...data,
        order: cart.ref.parent.parent!.id,
        key: cart.id === firebase.auth().currentUser!.uid ? ME : cart.id,
      }
      this.emit(Events.CartChange, o);
    } else if (!cart.exists) {
      this.emit(Events.CartRemove, cart.ref.parent.parent!.id);
    }
  }

  async sendCart(cart: CartRecord) {
    const order = await this.ensureOrder(cart.order);
    return await order
      .collection('carts').doc(firebase.auth().currentUser!.uid)
      .set({
        ...cart,
        userName: firebase.auth().currentUser!.displayName || 'Anonyme',
        userEmail: firebase.auth().currentUser!.email,
      });
  }

  async removeCart(order: string) {
    const o = await this.ensureOrder(order);
    return await o.collection('carts').doc(firebase.auth().currentUser!.uid).delete();
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
  }: Partial<Order> = {}): Promise<Order> {
    const db = await this.db;
    const o: Order = {
      expiration,
      fulfilled,
      cancelled,
      group,
      authorName: firebase.auth().currentUser!.displayName || 'Anonyme',
      author: firebase.auth().currentUser!.uid,
      total: 0,
      totalCarts: 0,
      sentCarts: 0,
    };
    const ref = await db.collection('groups').doc(group).collection('orders').add({
      ...o,
      authorEmail: firebase.auth().currentUser!.email,
    });

    return {
      ...o,
      author: ME,
      key: ref.id
    }
  }
  async cancelOrder(group: string, order: string) {
    console.log('Cancel order', group, order);
    const orderRef = await this.ensureOrder(order, group);
    return await orderRef.update({
      cancelled: true
    });
  }

  async listCarts(order: string) {
    const orderRef = await this.ensureOrder(order);
    const carts = await orderRef.collection('carts').get();

    return carts.docs.map(doc => doc.data()).filter(d => !!d) as Cart[];
  }
}
