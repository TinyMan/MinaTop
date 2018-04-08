export default {
  groups: [{
    key: "Groupe INNOV",
    fields: {
      name: "Steve Jobs"
    },
    collections: {
      orders: [
        {
          key: "order1",
          fields: {
            author: "TinyMan",
            fulfilled: false,
            total: 14.5
          },
          collections: {
            carts: [{
              key: "TinyMan",
              fields: {
                total: 14.5,
                items: [{
                  id: 193,
                  qty: 2,
                  title: "B1.Menu Yakitori B1",
                  price: 14.5
                }]
              },
              collections: {}
            }]
          }
        }
      ]
    }
  }]
}
