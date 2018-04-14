import { Action } from "./store";
import { Cart } from "../../lib/cart";
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
}
export const initialState: State = {
  cart: {
    total: 0,
    items: []
  },
  groups: {},
  orders: {},
  selectedGroup: null,
}

export class UpdateCartAction implements Action<State> {
  public readonly type = "UpdateCart";
  constructor(public readonly payload: Cart) { }

  public reduce(state: State): State {
    return {
      ...state,
      cart: this.payload
    }
  }
}

export class SelectGroupAction implements Action<State> {
  public readonly type = 'SelectGroup';
  constructor(public readonly payload: string) { }

  public reduce(state: State): State {
    return {
      ...state,
      selectedGroup: this.payload,
    }
  }
}

export class GroupChangeAction implements Action<State> {
  public readonly type = "GroupChange";
  constructor(public readonly payload: Group) { }

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
export class OrderChangeAction implements Action<State> {
  public readonly type = "OrderChange";
  constructor(public readonly payload: Order) { }

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
