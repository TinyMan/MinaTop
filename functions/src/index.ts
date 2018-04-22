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
