// #if process.env.NODE_ENV === 'development'
import 'chromereload/devonly'
// #endif

import firebase from 'firebase/app';
import 'firebase/auth';
import * as firebaseui from 'firebaseui';
import { firebase as fbConf } from '../background/config'

// FirebaseUI config.
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult(authResult, redirectUrl) {
      console.log(authResult, redirectUrl);
      window.close();
      return false;
    }
  },
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  ],
  signInFlow: 'popup',
};


function initApp() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var uid = user.uid;
      var phoneNumber = user.phoneNumber;
      var providerData = user.providerData;
      user.getIdToken().then(function (accessToken) {
        document.getElementById('sign-in-status')!.textContent = 'connecté';
        document.getElementById('sign-out')!.style.display = 'block';
      });
    } else {
      // User is signed out.
      document.getElementById('sign-in-status')!.textContent = 'déconnecté';
      document.getElementById('sign-out')!.style.display = 'none';
      // Initialize the FirebaseUI Widget using Firebase.
      var ui = new firebaseui.auth.AuthUI(firebase.auth());

      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  }, function (error) {
    console.log(error);
  });
};

window.addEventListener('load', function () {
  initApp()
});

firebase.initializeApp(fbConf);

document.getElementById('sign-out')!.onclick = () => firebase.auth().signOut();
