import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const onCreateOrder = functions.firestore.document('groups/{group}/orders/{order}').onCreate((snap, context) => {
  const { group, order } = context.params;

  return snap.ref.parent.parent.update({
    currentOrder: order
  });
})
