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

export class UpdateCartAction extends Action<State> {
  public readonly type = "UpdateCart";
  constructor(public readonly payload: Cart) { super() }

  public reduce(state: State): State {
    return {
      ...state,
      cart: this.payload
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
