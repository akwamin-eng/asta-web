import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AstaMap from './components/AstaMap';
import Dashboard from './components/dossier/Dashboard'; // FIXED PATH

function App() {
  return (
    <Router>
      <Routes>
        {/* The Golden State Map (Default Home) */}
        <Route path="/" element={<AstaMap />} />
        
        {/* The New Command Center */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
