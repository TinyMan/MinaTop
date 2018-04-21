import { html, render } from 'lit-html/lib/lit-extended';
import { State } from '../background/store/actions';
import { CartItem, Cart } from '../lib/cart';
import { Order } from '../lib/Order';
import { CreateOrderMessage, SelectGroupMessage, CancelOrderMessage, ToggleParticipateMessage, SendCartMessage, OrderMessage } from '../lib/MessageEvent';
import { sendMessage, addGroup, getTimeRemaining, leadingZero, getClassTimeRemaining, pluralize, openOptions, leaveGroup } from './helper';
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
export const btnOrder = (order: Order) => {
  if (order.author === ME) {
    return html`<button class="validate" on-click="${() => sendMessage(new OrderMessage(order))}">Passer la commande</button>`
  }
  return html``
}
export const btnSendCart = (order: Order, state: State) => {
  if (order.author === ME) {
    return html``;
  }
  return html`<button class="validate" on-click="${() => sendMessage(new SendCartMessage(order.key!))}" disabled="${state.cart.total <= 0 || !state.remoteCarts[order.key!].outdated}">Envoyer votre panier</button>`
}
export const btnParticipate = (order: Order, participate: boolean) => {
  if (order.author === ME) {
    return html``;
  }
  return html`<button on-click="${() => sendMessage(new ToggleParticipateMessage(order.key!))}">${participate ? 'Ne plus participer' : 'Participer'}</button>`
}
export const order_author = (order: Order) => {
  let a;
  if (order.author === ME) {
    a = html`<span>Votre commande</span>`
  } else {
    a = html`<span>Command effectuée par</span>
<span class="author-value">${order.authorName}</span>`
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
  else {
    let amount = 0;
    let text = '';
    if (hours <= 0) {
      if (minutes <= 0) {
        amount = seconds;
        text = `seconde`;
      }
      else {
        amount = minutes;
        text = `minute`;
      }
    }
    else {
      amount = hours;
      text = `heure`;
    }
    content = amount + ' ' + (amount > 1 ? pluralize(text) : text);
  }

  return html`<span class$="${getClassTimeRemaining(expiration)}">${content}</span>`;
}

export const order = (state: State, order: Order) => {
  const p = (order.key! in state.remoteCarts);
  return html`
<div class$="commande ${order.author === ME ? 'order-mine' : ''}">
  ${order_author(order)}
  <div class="expiration">
    <span>Expiration:</span>
    <span class="expiration-value" data-expiration$="${order.expiration}">${expiration(order.expiration)}</span>
  </div>
  <div class="participants">
    <span>Participants:</span>
  </div>
  ${btnParticipate(order, p)} ${p ? btnSendCart(order, state) : ''} ${btnCancel(order)} ${btnOrder(order)}
</div>
`
}

export const no_order = (group) => html`
<div class="no-order">
  <span>Aucune commande en cours.</span>
  <button on-click="${() => { sendMessage(new CreateOrderMessage(group)) }}">Proposer ma commande</button>
</div>
`

export const leaveIcon = (group: Group) => html`<img on-click="${e => (e.preventDefault(), leaveGroup(group))}" alt="Exit Sign icon" class="leave" src="https://png.icons8.com/material/25/ffffff/exit-sign.png">`;
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
  <summary>${group.key} ${leaveIcon(group)} </summary>
  ${group.currentOrder ? (o ? order(state, o) : loader) : no_order(group.key)}
</details>
`
}

export const nogroup = () => html`<div>
  <span class="nogroup">
    <i class="material-icons arrow">subdirectory_arrow_left</i>Vous n'etes dans aucun groupe ! Ajoutez un groupe pour commencer.</span>
</div>`;

export const groups = (state: State) => {
  if (Object.keys(state.groups).length === 0) return nogroup();
  return html`
<div class="groups">
  ${Object.keys(state.groups).map(k => group(state, k))}
</div>
`;
}

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

export const signIn = (state: State) => html`
<h3 class="signin">
  <a on-click="${() => openOptions()}" href="#">Connectez-vous</a> pour accedez aux groupes de commande</h3>
`

export const popup = (state: State) => html`
${state.signedin ? joinGroup() : signIn(state)} ${groups(state)} ${separator} ${table(state)}
`
