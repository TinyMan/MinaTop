import { makeSelector } from "./store";
import { State } from "./actions";

export const getGroupOrders = makeSelector((state: State) => state.groupOrders);
