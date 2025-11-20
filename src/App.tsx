import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Champions from './pages/Champions';
import ChampionDetail from './pages/ChampionDetail';
import Items from './pages/Items';
import Runes from './pages/Runes';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/champions" element={<Champions />} />
          <Route path="/champions/:id" element={<ChampionDetail />} />
          <Route path="/items" element={<Items />} />
          <Route path="/runes" element={<Runes />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
