import { html, render } from 'lit-html';
import { State } from '../background/store/actions';

export const btnCreate = html`<button class="start">Démarrer une commande groupée</button>`;

export const groups = (state: State) => html`
<div class="groups">
  <div class="group">
    <h1>Groupe INNOV</h1>
    <div class="commande">
      <div class="author">
        <span>Command effectuée par</span>
        <span class="author-value">Rick Sanchez</span>
      </div>
      <div class="expiration">
        <span>Expiration:</span>
        <span class="expiration-value">13:01</span>
      </div>
      <div class="participants">
        <span>Participants:</span>
        <span class="participants-value">3</span>
      </div>
      <button>Je suis intéressé</button>
    </div>
  </div>
</div>
`;

export const separator = () => html`<div class="separator"></div>`;

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
    <tr>
      <td colspan="3" class="empty">
        <h4>Votre panier est vide</h4>
      </td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="total">
      <th colspan="2">Total</th>
      <th>0&nbsp;€</th>
    </tr>
  </tfoot>
</table>`;

export const popup = (state: State) => html`
${btnCreate} ${groups(state)} ${separator()} ${table(state)}
`
