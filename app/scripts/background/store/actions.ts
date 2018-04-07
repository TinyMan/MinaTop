import { Action } from "./store";
import { Cart } from "../../lib/cart";
import { Order } from "../../lib/Order";

export interface State {
  readonly cart: Readonly<Cart>,
  readonly selectedOrder: Readonly<Order> | null,
  readonly selectedGroup: string,
}
export const initialState: State = {
  cart: {
    total: 0,
    items: []
  },
  selectedOrder: {
    author: 'Rick Sanchez',
    participants: 10,
    expiration: Date.now() + 1000 * 60 * 60,
    fulfilled: false,
  },
  selectedGroup: 'Groupe INNOV'
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
