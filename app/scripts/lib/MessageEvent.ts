import { CartItem } from "../CartItem";

export enum MessageType {
  CartUpdate = 'Cart Update',
  Echo = 'Echo message',
}
export interface IMessage {
  readonly type: MessageType;
}
export class CartUpdateMessage implements IMessage {
  public readonly type = MessageType.CartUpdate;
  constructor(public readonly payload: CartItem[]) { }
}

export class EchoMessage implements IMessage {
  public readonly type = MessageType.Echo;
  constructor(public readonly payload: any) { }
}

export type MinaTopMessage = CartUpdateMessage | EchoMessage;
