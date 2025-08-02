import React from 'react';
import './styles/App.css';
import Main from './components/Main'
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="App">
        <Sidebar></Sidebar>
        <Main></Main>
    </div>
  );
}

export default App;
