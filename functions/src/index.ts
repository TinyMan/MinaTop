import * as functions from 'firebase-functions';

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
  if (change.after.data().cancelled || change.after.data().fulfilled) {
    const { order } = context.params;
    const doc = await change.after.ref.parent.parent.get();
    if (doc.data().currentOrder === order)
      return await doc.ref.update({ currentOrder: null })
  }
  return 0;
})

export const onWriteCart = functions.firestore.document('groups/{group}/orders/{order}/carts/{cart}').onWrite(async (change, context) => {
  const deleted = !change.after.exists;
  const isNew = !change.before.exists;
  const oldDoc = isNew ? null : change.before.data();
  const newDoc = deleted ? null : change.after.data();

  const newTotal = deleted ? 0 : newDoc.total;
  const oldTotal = isNew ? 0 : oldDoc.total;

  const diff = newTotal - oldTotal;

  const cartSent = oldTotal === 0 && newTotal > 0 ? 1 : (oldTotal > 0 && newTotal === 0 ? -1 : 0);

  return change.before.ref.firestore.runTransaction(async () => {
    const order = await change.before.ref.parent.parent.get();
    return order.ref.update({
      total: (order.data().total || 0) + diff,
      totalCarts: (order.data().totalCarts || 0) + (deleted ? -1 : (isNew ? 1 : 0)),
      sentCarts: (order.data().sentCarts || 0) + cartSent,
    });
  }
  )
})
