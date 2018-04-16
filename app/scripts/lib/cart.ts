export interface CartItem {
  qty: number,
  title: string,
  id: string,
  price: number,
}

export interface Cart {
  items: CartItem[],
  total: number,
}

export interface CartRecord extends Cart {
  key?: string,
  order: string;
}
