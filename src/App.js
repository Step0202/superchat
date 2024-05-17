import React, { useState, useRef } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBTZxjuJkiPZhxkb_roLeHWI_v2GskqBFU",
  authDomain: "adv-project-42f1d.firebaseapp.com",
  projectId: "adv-project-42f1d",
  storageBucket: "adv-project-42f1d.appspot.com",
  messagingSenderId: "564746925267",
  appId: "1:564746925267:web:bbce3f9d76e6fe6d009026",
  measurementId: "G-4Q50HPYXXZ"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥ChatApp💬🔥</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
    } catch (error) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request cancelled');
      } else {
        console.error('Sign-in error:', error);
      }
    }
    setLoading(false);
  };

  return (
    <button onClick={signInWithGoogle} disabled={loading}>
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName, // Add display name here
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { id, text, uid, photoURL, displayName } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  const deleteMessage = async () => {
    try {
      await firestore.collection('messages').doc(id).delete();
      console.log('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className={`message ${messageClass}`}>
      <div className="user-info">
        <img className="profile-pic" src={photoURL} alt="Profile" />
        <p className="display-name">{displayName}</p> {/* Display the actual name */}
      </div>
      <p className="message-text">{text}</p> {/* Added className for styling */}
      {uid === auth.currentUser.uid && (
        <button onClick={deleteMessage} className="delete-button">Delete</button>
      )}
    </div>
  );
}

export default App;
