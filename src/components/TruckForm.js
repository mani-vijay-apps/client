import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const TruckForm = () => {
  const navigate = useNavigate();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/api/trucks`, { vehicleNumber });
      setMessage(' Truck added successfully!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('Error adding truck:', err);
      setMessage(err.response?.data?.message || ' Error adding truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h2>Add Truck</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Vehicle Number:</label>
          <input
            type="text"
            value={vehicleNumber}
            onChange={e => setVehicleNumber(e.target.value)}
            required
            placeholder="e.g. TN45AB1234"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Truck'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default TruckForm;