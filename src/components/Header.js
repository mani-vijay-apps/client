// components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="app-header">
    <h1>
      <Link to="/" className="home-link">Company Name</Link>
    </h1>
    <div className="button-group">
      <Link to="/trucks">
        <button className="btn">Truck Records</button>
      </Link>
      <Link to="/add-trip">
        <button className="btn">+ Add Trip</button>
      </Link>
      <Link to="/add-truck">
        <button className="btn">+ Add Truck</button>
      </Link>
    </div>
  </header>
);

export default Header;