// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'


const url = chrome.extension.getURL('scripts/injected.js');
var s = document.createElement('script');
s.src = url;
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
