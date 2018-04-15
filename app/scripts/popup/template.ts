import { html, render } from 'lit-html/lib/lit-extended';
import { State } from '../background/store/actions';
import { CartItem, Cart } from '../lib/cart';
import { Order } from '../lib/Order';
import { CreateOrderMessage, SelectGroupMessage, CancelOrderMessage } from '../lib/MessageEvent';
import { sendMessage, addGroup, getTimeRemaining, leadingZero, getClassTimeRemaining } from './helper';
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
    return html`<button class="cancel" on-click="${() => sendMessage(new CancelOrderMessage(order))}">Annuler la commande</button>`
  }
  return html``
}
export const btnSendCart = (order: Order) => {
  if (order.author === ME) {
    return html``;
  }
  return html`<button class="validate">Envoyer votre panier</button>`
}
export const btnParticipate = (order: Order) => {
  if (order.author === ME) {
    return html``;
  }
  return html`<button>Participer</button>`
}
export const order_author = (order: Order) => {
  let a;
  if (order.author === ME) {
    a = html`<span>Votre commande</span>`
  } else {
    a = html`<span>Command effectuée par</span>
<span class="author-value">${order.author}</span>`
  }
  return html`
  <div class="author">
    ${a}:
  </div>`
}
export const expiration = (expiration: number) => {
  const { days, hours, minutes, seconds, msDiff } = getTimeRemaining(expiration);
  let content = '';
  if (msDiff < 0)
    content = `Expirée`;
  else if (hours <= 0)
    if (minutes <= 0)
      content = `${seconds} secondes`;
    else
      content = `${minutes} minutes`;
  else
    content = `${hours} heures`;

  return html`<span class$="${getClassTimeRemaining(expiration)}">${content}</span>`;
}

export const order = (order: Order) => html`
<div class$="commande ${order.author === ME ? 'order-mine' : ''}">
  ${order_author(order)}
  <div class="expiration">
    <span>Expiration:</span>
    <span class="expiration-value" data-expiration$="${order.expiration}">${expiration(order.expiration)}</span>
  </div>
  <div class="participants">
    <span>Participants:</span>
  </div>
  ${btnParticipate(order)} ${btnSendCart(order)} ${btnCancel(order)}
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
