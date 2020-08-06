import React from 'react';
import { useState } from 'react';

import './App.css';
import AblyMessageComponent from './components/AblyMessageComponent.js'

function App() {
  
  const [ enabled, toggle ] = useState(true);
  const messaging = enabled ? (<AblyMessageComponent />) : (<div></div>);

  return (
    <div className="App">
      <header className="App-header">
        <h1>I am a react app</h1>
      </header>
      <label htmlFor="useably">Use Ably?</label>
      <input name="useably" type="checkbox" onChange={() => toggle(!enabled)}></input>      
      { messaging }
    </div>
  );
}

export default App;
