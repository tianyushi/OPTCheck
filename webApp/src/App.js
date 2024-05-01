import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import Home from './Home';
import Chatbox from './ChatBox';

function App() {
  return (
    <Router>
      <div>
        <Routes> 
          <Route path="/" element={<Home />} exact /> 
          <Route path="/chat" element={<Chatbox />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
