import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyCldYNzw_wGBoexS2im1PVJtg4wbD_Tais",
    authDomain: "cheese-fc1a2.firebaseapp.com",
    databaseURL: "https://cheese-fc1a2.firebaseio.com",
    projectId: "cheese-fc1a2",
    storageBucket: "cheese-fc1a2.appspot.com",
    messagingSenderId: "516161130245",
    appId: "1:516161130245:web:08e4b9662a221f7134716c",
    measurementId: "G-9TNFE0JSG4"
  };

firebase.initializeApp(firebaseConfig);

export default firebase;