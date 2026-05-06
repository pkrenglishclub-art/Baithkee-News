importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyC8csXaXQiGrlwg1vdKqm4CRBcsCcOFgiY",
    authDomain: "baithkeenews.firebaseapp.com",
    projectId: "baithkeenews",
    storageBucket: "baithkeenews.firebasestorage.app",
    messagingSenderId: "1051043299858",
    appId: "1:1051043299858:web:1b2c6b4aac4aaca4254ecb"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgxZYThJov7nVLeejJp30nZ130Js5tuIKOicgFSzAT8BV-sWAhDWy2oWKX5uzTY9BpRefSvN-leUHeaIvcTPDYCX7G2qjChtibiJapDQ1IzCTVekLffx7d-jZopQRENCRh-12BzEHwC4azCmX1mcavCBGCfa8Yf3Rhv0XxucZ6IwppXX1m_flG5YV1X8ig/s1600/20260412_015639_0000.png',
    image: payload.notification.image 
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
