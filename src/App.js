import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TripForm from './components/TripForm';
import TruckForm from './components/TruckForm';
import TripList from './components/TripList';
import TruckList from './components/TruckList';
import Header from './components/Header'; // Import the new header
import './App.css';

function App() {
  return (
    <Router>
      <div className="container">
        <Header /> {/* Header shown on all pages */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trucks" element={<TruckList />} />
          <Route path="/add-trip" element={<TripForm />} />
          <Route path="/add-truck" element={<TruckForm />} />
        </Routes>
      </div>
    </Router>
  );
}

const HomePage = () => (
  <section className="record-section">
    <h2>Trip List</h2>
    <TripList />
  </section>
);

export default App;