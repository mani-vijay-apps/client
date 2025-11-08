// components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="app-header">
    <h2>
      <Link to="/" className="home-link">Company Name</Link>
    </h2>
    <div className="button-group">
      <Link to="/trucks">
        <button className="btn truck-btn">Truck Records</button>
      </Link>
      <Link to="/add-trip">
        <button className="btn add-btn">+ Add Trip</button>
      </Link>
      <Link to="/add-truck">
        <button className="btn add-btn">+ Add Truck</button>
      </Link>
    </div>
  </header>
);

export default Header;