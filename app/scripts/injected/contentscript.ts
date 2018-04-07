// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'


const id = chrome.runtime.id;

function addScript(urlOrScript: string, plain = false) {
  var s = document.createElement('script');
  if (!plain) {
    s.src = urlOrScript;
  } else {
    s.innerHTML = urlOrScript;
  }

  (document.head || document.documentElement).appendChild(s);
}

addScript(`const EXT_ID = '${id}';`, true)

addScript(chrome.extension.getURL('scripts/injected.js'));


