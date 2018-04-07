import { CartItem } from "./lib/CartItem";
import { EchoMessage, MinaTopMessage, CartUpdateMessage } from "./lib/MessageEvent";

declare var EXT_ID: string;


// Monkey patch XMLHttpRequest to get cart items
const old = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method, url, ...args: any[]) {
  if (method === 'GET' && url.match(/strReloadPanierRight\.php/)) {
    this.addEventListener("readystatechange", e => {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        const regex = /(\d+)&nbsp;x<\/span>([^<]+)<[\s\S]+?onclick="ModifProdPanier\('(\d+)'/g;
        const items: CartItem[] = []
        let match = regex.exec(this.responseText);
        while (match != null) {
          const [, qty, title, id] = match;
          items.push({
            qty: parseInt(qty, 10),
            title: title.trim(),
            id,
          })
          match = regex.exec(this.responseText);
        }

        updateCart(items);
      }
    })
  }
  return old.call(this, method, url, ...args);
}


function updateCart(items: CartItem[]) {
  console.log(items);
  sendMessage(new CartUpdateMessage(items));

}
function sendMessage(message: MinaTopMessage, callback?: (response: any) => void) {
  return chrome.runtime.sendMessage(EXT_ID, message, callback);
}

// sendMessage(new EchoMessage({ complex: 'message', object: { key: 1 } }), e => console.log(e));
