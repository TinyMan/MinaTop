# MinaTop

Effectuer une commande groupée sur le site de minato91.fr

## Installation
```
  $ git clone https://github.com/TinyMan/MinaTop.git
  $ cd MinaTop
  $ npm install
 ```

## Dev mode

First you have to create your firebase configuration: `scripts/background/config.ts`. Example config:
```ts
export const firebase = {
  "projectId": "project-id",
  "apiKey": "your-apikey",
  "authDomain": "project-id.firebaseapp.com"
}
```


``` 
$ npm start
 ```
  
  Then go to [chrome://extensions](chrome://extensions), tick 'developper mode' and `add unpacked extension` > select `dist/chrome` folder into the root of MinaTop


## Usage

* First step: join a group. Enter your group's name in the browser action popup and hit enter.
* Second you can go to [www.minato91.fr](https://www.minato91.fr) and make your cart.
* You can then contribute with your cart if there is any ungoing order or you can start an order.
