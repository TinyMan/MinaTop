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


export function cartEquals(c1: Cart, c2: Cart): boolean {

  if (c1.total !== c2.total || c1.items.length !== c2.items.length) return false;

  for (let i = 0; i < c1.items.length; i++) {
    const i1 = c1.items[i], i2 = c2.items[i];
    if (i1.id !== i2.id || i1.qty !== i2.qty) return false;
  }
  return true;
}
