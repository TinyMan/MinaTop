import * as functions from 'firebase-functions';
import { createTransport } from 'nodemailer';
// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

interface CartItem {
  id: string;
  price: number;
  qty: number;
  title: string;
}
interface Cart {
  items: CartItem[];
  total: number;
  order: string;
  userName: string;
  userEmail: string;
}
interface Order {
  authorName: string;
  author: string;
  authorEmail?: string;
  cancelled: boolean;
  expiration: number;
  fulfilled: boolean;
  group: string;
  sentCarts: number;
  total: number;
  totalCarts: number;
}
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const onCreateOrder = functions.firestore.document('groups/{group}/orders/{order}').onCreate((snap, context) => {
  const { order } = context.params;

  return snap.ref.parent.parent.update({
    currentOrder: order
  });
})
export const onUpdateOrder = functions.firestore.document('groups/{group}/orders/{order}').onUpdate(async (change, context) => {
  const order = change.after.data() as Order;
  if (order.cancelled || order.fulfilled) {
    const promises: Promise<any>[] = [];

    const { order: orderId } = context.params;
    const doc = await change.after.ref.parent.parent.get();
    if (doc.data().currentOrder === orderId)
      promises.push(doc.ref.update({ currentOrder: null }));

    // send emails
    if (order.fulfilled && !change.before.data().fulfilled) {
      const date = formatDate(new Date());
      const carts: Cart[] = (await change.after.ref.collection('carts').get()).docs.map(cart => cart.data() as Cart);
      promises.concat(
        carts.map(cart => sendOrderCompleteEmail(order, cart, date)),
        sendOrderCompleteForAuthor(order, carts, date)
      );
    }
    return await Promise.all(promises);
  }
  return 0;
})

export const onWriteCart = functions.firestore.document('groups/{group}/orders/{order}/carts/{cart}').onWrite(async (change, context) => {
  return change.before.ref.firestore.runTransaction(async () => {
    const carts = await change.before.ref.parent.get();
    const order = await change.before.ref.parent.parent.get();

    const cartsData = carts.docs.filter(doc => doc.exists).map(doc => doc.data());
    const total = cartsData.reduce((a, e) => a + e.total, 0);
    const totalCarts = cartsData.length;
    const sentCarts = cartsData.filter(c => c.total > 0).length;
    return order.ref.update({
      total,
      totalCarts,
      sentCarts,
    });
  })
})

async function sendOrderCompleteEmail(order: Order, cart: Cart, date: string) {
  if (!cart.userEmail) {
    console.log(`User ${cart.userName} has no email`);
    return;
  }
  const emailOptions = {
    from: 'MinaTop <noreply@firebase.com>',
    to: cart.userEmail,
    subject: `Commande du ${date} terminée (${cart.total} €)`,
    html: createOrderCompleteEmail({ name: cart.userName, total: cart.total, items: cart.items, author: order.authorName, date }),
  }
  try {
    await mailTransport.sendMail(emailOptions);
    console.log("Order completion email sent to " + cart.userEmail);
  } catch (e) {
    console.error("Order completion email NOT SENT (" + cart.userEmail + ")", e);
  }
}
async function sendOrderCompleteForAuthor(order: Order, carts: Cart[], date: string) {
  const { authorEmail: email, total } = order;
  if (!email) {
    console.log("Order author has no email");
    return;
  }
  const emailOptions = {
    from: 'MinaTop <noreply@firebase.com>',
    to: email,
    subject: `Commande du ${date} terminée (${total} €)`,
    html: createOrderCompleteEmailForAuthor(order, carts, date),
  }
  try {
    await mailTransport.sendMail(emailOptions);
    console.log("Order completion email sent to author (" + email + ")");
  } catch (e) {
    console.error("Order completion email NOT SENT (" + email + ")", e);
  }
}
function formatDate(date: Date): string {

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return day + '/' + (monthIndex + 1) + '/' + year;
}


function createOrderCompleteEmail(infos: {
  author: string,
  name: string,
  total: number,
  date: string,
  items: CartItem[],
}) {
  return `
Bonjour ${infos.name},
<br>
<br>
La commande sur MinaTop effectuée par ${infos.author} est terminée (commande du ${infos.date}).
<br>
<br>
Récapitulatif de votre commande (n'inclut pas les commandes des autres participants):
${createItemsTable(infos.items, infos.total)}
<br>
<br>
A bientôt sur MinaTop !
`;
}
function createOrderCompleteEmailForAuthor(order: Order, carts: Cart[], date: string) {
  return `
Bonjour ${order.authorName},
<br>
<br>
Votre commande sur MinaTop est terminée (commande du ${date}).
<br>
<br>
Voici un récapitulatif de la commande:
${carts.map(cart => createItemsTable(cart.items, cart.total, cart.userName)).join("<br>")}
Note: votre panier personnel n'apparait pas.
<br>
<br>
A bientôt sur MinaTop !
`;
}

function createItemsTable(items: CartItem[], total: number, caption = "Votre commande") {
  return `
 <table border="1">
 <caption>${caption}</caption>
 <thead><th>Nom</th><th>Prix</th><th>Qty</th><th>Total</th></thead>
 <tbody>
 ${items.map(item => `<tr><td>${item.title}</td><td>${item.price}</td><td>${item.qty}</td><td>${item.qty * item.price}</td></tr>`).join('')}
 <tr><td colspan="3">Total:</td><td>${total}</td></tr>
 </tbody>
 </table>`;
}
