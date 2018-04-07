import { Action } from "./store";
import { Cart } from "../../lib/cart";

export interface State {
  cart: Cart,
}
export const initialState: State = {
  cart: {
    total: 0,
    items: []
  },
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
