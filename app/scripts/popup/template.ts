import { html, render } from 'lit-html';
import { State } from '../background/store/actions';
import { CartItem, Cart } from '../lib/cart';
import { Order } from '../lib/Order';

export const btnCreate = html`<button class="start">Démarrer une commande groupée</button>`;

export const order = (order: Order) => html`

<div class="commande">
  <div class="author">
    <span>Command effectuée par</span>
    <span class="author-value">${order.author}</span>
  </div>
  <div class="expiration">
    <span>Expiration:</span>
    <span class="expiration-value"></span>
  </div>
  <div class="participants">
    <span>Participants:</span>
    <span class="participants-value">${order.participants}</span>
  </div>
  <button>Je suis intéressé</button>
</div>
`
export const groups = (state: State) => html`
<div class="groups">
  <div class="group">
    <h1>${state.selectedGroup}</h1>
    ${order(state.selectedOrder!)}
  </div>
</div>
`;

export const separator = html`<div class="separator"></div>`;

export const table_row = (item: CartItem) => html`
<tr>
  <td>${item.qty}&nbsp;x</td>
  <td>${item.title}</td>
  <td>${item.price}&nbsp;€</td>
</tr>
`

export const empty_row = html`
<tr>
  <td colspan="3" class="empty">
    <h4>Votre panier est vide</h4>
  </td>
</tr>`

export const table_content = (cart: Cart) => {
  if (cart.items.length > 0) return cart.items.map(item => table_row(item));
  else return empty_row;
}

export const table = (state: State) => html`
<table id="cart">
  <caption>
    <span class="your_cart">Votre panier:</span>
    <button class="validate">Envoyer votre panier</button>
  </caption>
  <colgroup>
    <col>
    <col>
    <col>
  </colgroup>
  <thead>
  </thead>
  <tbody>
    ${table_content(state.cart)}
  </tbody>
  <tfoot>
    <tr class="total">
      <th colspan="2">Total</th>
      <th>${state.cart.total}&nbsp;€</th>
    </tr>
  </tfoot>
</table>`;

export const popup = (state: State) => html`
${btnCreate} ${groups(state)} ${separator} ${table(state)}
`
