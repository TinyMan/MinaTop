import { Action } from "./store";
import { CartItem } from "../../lib/CartItem";

export interface State {
  cart: CartItem[],
}
export const initialState: State = {
  cart: [],
}

export class UpdateCartAction implements Action<State> {
  public readonly type = "UpdateCart";
  constructor(public readonly payload: CartItem[]) { }

  public reduce(state: State) {
    return {
      ...state,
      cart: this.payload
    }
  }
}
