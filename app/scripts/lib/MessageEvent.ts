import { Cart } from "./cart";
import { State } from "../background/store/actions";

export enum MessageType {
  UpdateCart = 'Cart Update',
  Echo = 'Echo message',
  NewState = 'New State',
  GetState = 'Get State',
  CreateOrder = 'Create Order',
}
export interface IMessage {
  readonly type: MessageType;
}
export class UpdateCartMessage implements IMessage {
  public readonly type = MessageType.UpdateCart;
  constructor(public readonly payload: Cart) { }
}

export class EchoMessage implements IMessage {
  public readonly type = MessageType.Echo;
  constructor(public readonly payload: any) { }
}
export class NewStateMessage implements IMessage {
  public readonly type = MessageType.NewState;
  constructor(public readonly payload: State) { }
}
export class GetStateMessage implements IMessage {
  public readonly type = MessageType.GetState;
}
export class CreateOrderMessage implements IMessage {
  public readonly type = MessageType.CreateOrder;
}

export type MinaTopMessage = UpdateCartMessage
  | EchoMessage
  | NewStateMessage
  | GetStateMessage
  | CreateOrderMessage;
