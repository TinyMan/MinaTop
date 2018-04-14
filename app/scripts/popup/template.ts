import { html, render } from 'lit-html/lib/lit-extended';
import { State } from '../background/store/actions';
import { CartItem, Cart } from '../lib/cart';
import { Order } from '../lib/Order';
import { CreateOrderMessage, SelectGroupMessage } from '../lib/MessageEvent';
import { sendMessage, addGroup } from './helper';
import { Group } from '../lib/group';
import { ME } from '../lib/utils';

export const joinGroup = () => {
  const listener = (e: KeyboardEvent) => {
    if (e && e.code === 'Enter' && e.target) {
      const target = e.target as HTMLInputElement;
      addGroup(target.value)
      target.value = '';
    }
  };
  return html`
<input placeholder="Rejoindre un groupe" type="text" name="group" id="group" on-keypress="${listener}">
`
}

export const loader = html`<div class="loader">Loading ...</div>`

// <span class="participants-value">${order.participants}</span>
export const btnCancel = (order: Order) => {
  if (order.author === ME) {
    return html`<button class="cancel">Annuler la commande</button>`
  }
  return ''
}
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
  </div>
  <button>Participer</button>
  <button class="validate">Envoyer votre panier</button>
  ${btnCancel(order)}
</div>
`

export const no_order = (group) => html`
<div class="no-order">
  <span>Aucune commande en cours.</span>
  <button on-click="${() => { sendMessage(new CreateOrderMessage(group)) }}">Proposer ma commande</button>
</div>
`
export const group = (state: State, key: string) => {
  const group = state.groups[key];
  const o = state.orders[group.currentOrder!];
  const onToggle = (e: Event) => {
    const open = (e.target as HTMLDetailsElement).open;
    if (open) {
      sendMessage(new SelectGroupMessage(key));
    }
  }
  return html`
<details class="group" on-toggle="${onToggle}" open="${state.selectedGroup === key}">
  <summary>${group.key}</summary>
  ${group.currentOrder ? (o ? order(o) : loader) : no_order(group.key)}
</details>
`
}

export const groups = (state: State) => html`
<div class="groups">
  ${Object.keys(state.groups).map(k => group(state, k))}
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
    <h4>Votre panier est vide.</h4>
    <h5>Rendez-vous sur
      <a target="_blank" href="https://www.minato91.fr/">www.minato91.fr</a> pour le remplir</h5>
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
${joinGroup()} ${groups(state)} ${separator} ${table(state)}
`
