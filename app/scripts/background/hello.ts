export function hello() {
  chrome.webRequest.onHeadersReceived.addListener(details => {
    console.log(details);
    if (details.method === 'GET' && details.responseHeaders) {
      const set_cookie = details.responseHeaders.find(h => h.name === 'set-cookie');
      if (set_cookie && set_cookie.value) {
        const matches = set_cookie.value.match(/^([^=]+)=([^;]+);/);
        if (matches && matches.length > 2) {
          const [, name, value] = matches;
          console.log(name, value);
          fetch('https://www.minato91.fr/strReloadPanierRight.php?_=' + Math.ceil(Math.random() * 1000), {
            headers: {
              cookie: `${name}=${value};`,
            },
          }).then(e => console.log(e))
        }
      }
    }
  }, {
      urls: ['https://www.minato91.fr/script/ModifCookiePanier.php*'],
    }, ['responseHeaders'])
}
