export interface CartItem {
  qty: number,
  title: string,
  id: string,
  price: number,
}

export interface CartItems {
  [id: string]: CartItem;
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

export function mergeCarts(carts: Cart[]) {
  return carts.reduce((a, e) => {
    return {
      total: e.total + a.total,
      items: mergeItems(e.items, a.items)
    }
  }, { total: 0, items: [] });
}

export function mergeItems(a: CartItem[], b: CartItem[]) {
  const result = convertToCartItems(a);
  b.forEach(cart => {
    if (!(cart.id in result)) {
      result[cart.id] = cart;
    } else {
      result[cart.id].qty += cart.qty
    }
  });
  return convertToArray(result);
}

export function convertToCartItems(items: CartItem[]): CartItems {
  return items.reduce((a, e) => ({ ...a, [e.id]: e }), {});
}
export function convertToArray(items: CartItems) {
  return Object.values(items);
}
