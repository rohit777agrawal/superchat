import React, { useRef, useState } from 'react'
import './App.css'
import sound from './assets/sound.mp3'

//These are imports of firebase SDK
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'             //This is for database
import 'firebase/compat/auth'                  //This is for authentication

// These are react-firebase-hooks to make it easier to use firebase
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'

// This help to identify the project
firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID

})

//Reference to Firebase SDK'S for global variables
const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
    <header>
      <h1>Chat</h1>
      <SignOut />
    </header>

    <section>
      {user ? <ChatRoom /> : <SignIn />}
    </section>

    </div>

  );
}

function SignIn(){
  const signInWithGoogle = ()=>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const messageRef = firestore.collection('messages');  //This reference to the collection
  const query = messageRef.orderBy('createdAt'); //This reference to the timestamp it was created.
  const [messages] = useCollectionData(query, { idField: 'id' });
  const dummy = useRef();

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) =>{
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await messageRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
    });
    setFormValue('');
    dummy.current.scrollIntoView({behavior:'smooth'});
  }

  return(
    <>
      
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      {/* "sendMessage is going to write to the database" */}
      <form onSubmit={sendMessage} >
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type='Submit'>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  let audio = new Audio(sound);
  const start = () => {
  audio.play()
  }

  // Comparing current user ID with Current user ID, to know 
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img onLoad={start} src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt=""/>
      <p>{text}</p>
    </div>
  </>)
}

export default App;
