import { CartItem, Cart } from "../lib/cart";
import { EchoMessage, MinaTopMessage, UpdateCartMessage } from "../lib/MessageEvent";

declare var EXT_ID: string;


// Monkey patch XMLHttpRequest to get cart items
const old = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method, url, ...args: any[]) {
  if (method === 'GET' && url.match(/strReloadPanierRight\.php/)) {
    this.addEventListener("readystatechange", e => {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        updateCart(getCart(this.responseText));
      }
    })
  }
  return old.call(this, method, url, ...args);
}

function getCart(html: string) {
  const regex = /(\d+)&nbsp;x<\/span>([^<]+)<[\s\S]+?>([\d\.]+)&nbsp;€<[\s\S]+?onclick="ModifProdPanier\('(\d+)'/g;
  const items: CartItem[] = []
  let match = regex.exec(html);
  while (match != null) {
    const [, qty, title, price, id] = match;
    items.push({
      qty: parseInt(qty, 10),
      title: title.trim(),
      id,
      price: parseFloat(price),
    })
    match = regex.exec(html);
  }
  return {
    items,
    total: items.reduce((a, e) => a + e.price, 0),
  };
}

function updateCart(cart: Cart) {
  console.log(cart);
  sendMessage(new UpdateCartMessage(cart));

}
function sendMessage(message: MinaTopMessage, callback?: (response: any) => void) {
  return chrome.runtime.sendMessage(EXT_ID, message, callback);
}

updateCart(getCart(document.querySelector('#PanierRight')!.innerHTML));
