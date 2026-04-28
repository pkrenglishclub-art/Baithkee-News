importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyAwpf0IEd0wl6mvJ6EV5XB3XQYoLwmWXZQ",
    authDomain: "baithkee-news.firebaseapp.com",
    projectId: "baithkee-news",
    storageBucket: "baithkee-news.firebasestorage.app",
    messagingSenderId: "274990392562",
    appId: "1:274990392562:web:25c3b84d13fc84cdfbdc6b"
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
