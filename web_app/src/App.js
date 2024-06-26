import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import Home from './Home';
import Chatbox from './ChatBox';
import FAQ from './FAQ';
import ValidateOPT from './validatePage';

function App() {
  return (
    <Router>
      <div>
        <Routes> 
          <Route path="/" element={<Home />} exact /> 
          <Route path="/chat" element={<Chatbox />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/validate" element={<ValidateOPT />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
