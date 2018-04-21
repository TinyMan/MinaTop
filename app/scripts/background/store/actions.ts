import { Action } from "./store";
import { Cart, CartRecord, cartEquals } from "../../lib/cart";
import { Order } from "../../lib/Order";
import { Group } from "../../lib/group";

export interface State {
  readonly cart: Readonly<Cart>,
  readonly groups: {
    [key: string]: Group,
  }
  readonly orders: {
    [key: string]: Order,
  }
  readonly selectedGroup: string | null;
  readonly remoteCarts: {
    [key: string]: Readonly<CartRecord & { outdated: boolean }>
  };
  readonly signedin: boolean;
}
export const initialState: State = {
  cart: {
    total: 0,
    items: []
  },
  groups: {},
  orders: {},
  selectedGroup: null,
  remoteCarts: {},
  signedin: false,
}

export class UpdateCartAction extends Action<State> {
  public readonly type = "UpdateCart";
  constructor(public readonly payload: Cart) { super() }

  public reduce(state: State): State {
    const remoteCarts = Object.values(state.remoteCarts).map(rc => ({
      ...rc,
      outdated: !cartEquals(rc, this.payload),
    })).reduce((acc, el) => ({
      ...acc,
      [el.order]: el,
    }), {});
    return {
      ...state,
      cart: this.payload,
      remoteCarts,
    }
  }
}

export class SelectGroupAction extends Action<State> {
  public readonly type = 'SelectGroup';
  constructor(public readonly payload: string) { super() }

  public reduce(state: State): State {
    return {
      ...state,
      selectedGroup: this.payload,
    }
  }
}

export class GroupChangeAction extends Action<State> {
  public readonly type = "GroupChange";
  constructor(public readonly payload: Group) { super() }

  public reduce(state: State): State {
    return {
      ...state,
      groups: {
        ...state.groups,
        [this.payload.key]: this.payload
      }
    }
  }
}
export class OrderChangeAction extends Action<State> {
  public readonly type = "OrderChange";
  constructor(public readonly payload: Order) { super() }

  public reduce(state: State): State {
    return {
      ...state,
      orders: {
        ...state.orders,
        [this.payload.key!]: this.payload
      }
    }
  }
}
export class AddGroupAction extends Action<State> {
  public readonly type = "AddGroup";
  constructor(public readonly payload: string) { super() }

}
export class AddOrderAction extends Action<State> {
  public readonly type = "AddOrder";
  constructor(public readonly group: string) { super() }

}
export class AddOrderSuccessAction extends Action<State> {
  public readonly type = "AddOrderSuccess";
  constructor(public readonly payload: Order) { super() }

  public reduce(state: State): State {
    if (this.payload.key) {
      return {
        ...state,
        groups: {
          ...state.groups,
          [this.payload.group]: {
            ...state.groups[this.payload.group],
            currentOrder: this.payload.key
          }
        },
        orders: {
          ...state.orders,
          [this.payload.key]: this.payload,
        }
      }
    } else return state;
  }

}
export class CancelOrderAction extends Action<State> {
  public readonly type = "CancelOrder";
  constructor(public readonly payload: Order) { super() }
}
export class ParticipateAction extends Action<State> {
  public readonly type = "Participate";
  constructor(public readonly payload: { order: string, participate: boolean }) { super() }

}
export class RemoteCartUpdateAction extends Action<State> {
  public readonly type = "RemoteCartUpdate";
  constructor(public readonly payload: CartRecord) { super() }

  public reduce(state: State): State {
    return {
      ...state,
      remoteCarts: {
        ...state.remoteCarts,
        [this.payload.order]: {
          ...this.payload,
          outdated: !cartEquals(this.payload, state.cart),
        }
      },
    }
  }
}
export class RemoteCartRemoveAction extends Action<State> {
  public readonly type = "RemoteCartRemove";
  constructor(public readonly payload: string) { super() }

  public reduce(state: State): State {
    const remoteCarts = { ...state.remoteCarts };
    delete remoteCarts[this.payload];
    return {
      ...state,
      remoteCarts,
    }
  }
}
export class CancelOrderSuccessAction extends Action<State> {
  public readonly type = "CancelOrderSuccess";
  constructor(public readonly payload: Order) { super() }

  public reduce(state: State): State {
    return {
      ...state,
      groups: {
        ...state.groups,
        [this.payload.group]: {
          ...state.groups[this.payload.group],
          currentOrder: null
        }
      }
    }
  }
}
export class SendCartAction extends Action<State> {
  public readonly type = "SendCart";
  constructor(public readonly order: string) { super() }

}

export class SignInSuccessAction extends Action<State> {
  public readonly type = 'SignInSuccessAction';
  public reduce(state: State): State {
    return {
      ...state,
      signedin: true,
    }
  }
}
export class SignOutAction extends Action<State> {
  public readonly type = 'SignOutAction';
  public reduce(state: State): State {
    return {
      ...state,
      signedin: false,
      groups: {},
      orders: {},
      selectedGroup: null,
      remoteCarts: {}
    }
  }
}
