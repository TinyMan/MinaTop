import { CartItem, Cart } from "./cart";

const substitute = {
  "A": "02",
  "B": "01",
  "C": "00",
  "D": "07",
  "E": "06",
  "F": "05",
  "G": "04",
  "H": "0b",
  "I": "0a",
  "J": "09",
  "K": "08",
  "L": "0f",
  "M": "0e",
  "N": "0d",
  "O": "0c",
  "P": "13",
  "Q": "12",
  "R": "11",
  "S": "10",
  "T": "17",
  "U": "16",
  "V": "15",
  "W": "14",
  "X": "1b",
  "Y": "1a",
  "Z": "19",
  "[": "18", // ?
  "\\": "1f", // ?
  "]": "1e", // ?
  "^": "1d", // ?
  "_": "1c", // ?
  "`": "23", // ?
  "a": "22",
  "b": "21",
  "c": "20",
  "d": "27",
  "e": "26",
  "f": "25",
  "g": "24",
  "h": "2b",
  "i": "2a",
  "j": "29",
  "k": "28",
  "l": "2f",
  "m": "2e",
  "n": "2d",
  "o": "2c",
  "p": "33",
  "q": "32",
  "r": "31",
  "s": "30",
  "t": "37",
  "u": "36",
  "v": "35",
  "w": "34",
  "x": "3b",
  "y": "3a",
  "z": "39",
  "|": "3f",

  " ": "63",
  "!": "62", // ?
  "\"": "61", // ?
  "#": "60", // ?
  "$": "67", // ?
  "%": "66", // ?
  "&": "65", // ?
  "'": "64", // ?
  "(": "6b",
  ")": "6a",
  "*": "69", // ?
  "+": "68", // ?
  ",": "6f", // ?
  "-": "6e",
  ".": "6d", // ?
  "/": "6c", // ?
  "0": "73",
  "1": "72",
  "2": "71",
  "3": "70",
  "4": "77",
  "5": "76",
  "6": "75",
  "7": "74",
  "8": "7b",
  "9": "7a",
}

export function encode(str: string) {
  return str.split('').map(a => substitute[a]).join('')
}
export function decode(str: string) {
  return str.match(/.{2}/g)!.map(char => Object.entries(substitute).find(([k, c]) => c === char)![0]).join('');
}

export function encodeItem(item: CartItem) {
  return joinParts([
    encode(item.id + ''),
    encode(item.title),
    encode(item.qty + ''),
    encode(item.price.toFixed(2)),
  ]);
}

export function joinParts(parts: string[]) {
  return parts.join('65');
}
export function joinItems(items: CartItem[]) {
  return items.map(i => encodeItem(i)).join('3f');
}

export function encodeCart(cart: Cart) {
  return joinItems(cart.items);
}
export function decodeCart(cart: string) {
  const items: CartItem[] = [];
  const regex = /(.+)65(.+)65(.+)65(.+)(?:3f)?/g;
  let match = regex.exec(cart);
  while (match) {
    const [, id, title, qty, price] = match;
    items.push({
      qty: parseInt(decode(qty), 10),
      title: decode(title),
      id: decode(id),
      price: parseFloat(decode(price)),
    })
    match = regex.exec(cart);
  }

  return {
    total: 0,
    items,
  };
}

// IDArticle = 324
// IDChoixProd = 0
// Quantite = 2543
// Prix = 457
// TypeProd = 1

// IDArticle |                                                              |    Quantite  |     Prix
//  3  2  4  |                                                              |  2  5  4  3  |  4  5  7
// 70 71 77 65 10 22 2d 63 33 26 2f 2f 26 24 31 2a 2d 2c 63 6b 2f 63 0f 6a 65 71 76 77 70 65 77 76 74 3f
