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
