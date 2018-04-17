import { Cart } from "./cart";
import { State } from "../background/store/actions";
import { Order } from "./Order";

export enum MessageType {
  UpdateCart = 'Cart Update',
  Echo = 'Echo message',
  NewState = 'New State',
  GetState = 'Get State',
  CreateOrder = 'Create Order',
  CancelOrder = 'Cancel Order',
  SelectGroup = 'Select Group',
  AddGroup = 'Add Group',
  ToggleParticipate = 'Toggle Participate',
  SendCart = 'Send Cart',
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
  constructor(public readonly group: string) { }
}
export class CancelOrderMessage implements IMessage {
  public readonly type = MessageType.CancelOrder;
  constructor(public readonly payload: Order) { }
}
export class SelectGroupMessage implements IMessage {
  public readonly type = MessageType.SelectGroup;
  constructor(public readonly payload: string) { }
}
export class AddGroupMessage implements IMessage {
  public readonly type = MessageType.AddGroup;
  constructor(public readonly payload: string) { }
}
export class ToggleParticipateMessage implements IMessage {
  public readonly type = MessageType.ToggleParticipate;
  constructor(public readonly payload: string) { }
}
export class SendCartMessage implements IMessage {
  public readonly type = MessageType.SendCart;
  constructor(public readonly payload: string) { }
}

export type MinaTopMessage = UpdateCartMessage
  | EchoMessage
  | NewStateMessage
  | GetStateMessage
  | CreateOrderMessage
  | CancelOrderMessage
  | SelectGroupMessage
  | AddGroupMessage
  | ToggleParticipateMessage
  | SendCartMessage;
