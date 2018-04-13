import { Action } from "./store";
import { Cart } from "../../lib/cart";
import { Order } from "../../lib/Order";

export interface State {
  readonly cart: Readonly<Cart>,
  readonly selectedOrder: Readonly<Order> | null,
  readonly selectedGroup: string | null,
  readonly groupOrders: {
    [key: string]: string
  },
}
export const initialState: State = {
  cart: {
    total: 0,
    items: []
  },
  selectedOrder: {
    author: 'Rick Sanchez',
    expiration: Date.now() + 1000 * 60 * 60,
    fulfilled: false,
  },
  selectedGroup: null,
  groupOrders: {},
}

export class UpdateCartAction implements Action<State> {
  public readonly type = "UpdateCart";
  constructor(public readonly payload: Cart) { }

  public reduce(state: State) {
    return {
      ...state,
      cart: this.payload
    }
  }
}

export class SelectGroupAction implements Action<State> {
  public readonly type = 'SelectGroup';
  constructor(public readonly payload: string) { }

  public reduce(state: State) {
    return {
      ...state,
      selectdGroup: this.payload,
    }
  }
}
