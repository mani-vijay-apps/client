import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TripForm from './components/TripForm';
import TruckForm from './components/TruckForm';
import TripList from './components/TripList';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-trip" element={<TripForm />} />
        <Route path="/add-truck" element={<TruckForm />} />
      </Routes>
    </Router>
  );
}

const HomePage = () => (
  <div className="container">
    <header className="app-header">
      <h1>Trip Records</h1>
      <div className="button-group">
        <Link to="/add-trip">
          <button className="btn">+ Add Trip</button>
        </Link>
        <Link to="/add-truck">
          <button className="btn">+ Add Truck</button>
        </Link>
      </div>
    </header>
    <TripList />
  </div>
);

export default App;